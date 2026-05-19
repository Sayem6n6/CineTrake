import "server-only";

import bcrypt from "bcryptjs";
import { createHmac, randomBytes, randomInt, timingSafeEqual } from "crypto";
import { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import { getDb } from "@/lib/mongodb";

export type AppUser = {
  _id: ObjectId;
  username: string;
  passwordHash: string;
  role?: "admin" | "user";
  createdAt: Date;
};

type AppSession = {
  _id: ObjectId;
  token: string;
  userId: ObjectId;
  expiresAt: Date;
  createdAt: Date;
};

const sessionCookieName = "cinetrake_session";
const sessionDurationMs = 1000 * 60 * 60 * 24 * 30;

function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

export async function ensureAdminUser() {
  const username = normalizeUsername(process.env.ADMIN_USERNAME ?? "admin");
  const password = process.env.ADMIN_PASSWORD;

  if (!password) return;

  const db = await getDb();
  const users = db.collection<AppUser>("users");
  const existingAdmin = await users.findOne({ username });

  if (existingAdmin) {
    if (existingAdmin.role !== "admin") {
      await users.updateOne({ _id: existingAdmin._id }, { $set: { role: "admin" } });
    }
    return;
  }

  await users.insertOne({
    _id: new ObjectId(),
    username,
    passwordHash: await bcrypt.hash(password, 12),
    role: "admin",
    createdAt: new Date(),
  });
}

export function createCaptcha() {
  const left = randomInt(2, 10);
  const right = randomInt(2, 10);
  const expires = Date.now() + 1000 * 60 * 15;
  const answer = String(left + right);
  const payload = `${answer}:${expires}`;
  const signature = createHmac("sha256", process.env.AUTH_SECRET ?? process.env.MONGODB_URI ?? "")
    .update(payload)
    .digest("hex");

  return {
    question: `${left} + ${right}`,
    token: Buffer.from(`${payload}:${signature}`).toString("base64url"),
  };
}

export function validateCaptcha(token: string, input: string) {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const [answer, expires, signature] = decoded.split(":");
    const payload = `${answer}:${expires}`;
    const expected = createHmac(
      "sha256",
      process.env.AUTH_SECRET ?? process.env.MONGODB_URI ?? "",
    )
      .update(payload)
      .digest("hex");

    return (
      Number(expires) > Date.now() &&
      answer === input.trim() &&
      timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
    );
  } catch {
    return false;
  }
}

export async function createUser(username: string, password: string) {
  const db = await getDb();
  const users = db.collection<AppUser>("users");
  const normalizedUsername = normalizeUsername(username);

  if (!/^[a-z0-9_]{3,24}$/.test(normalizedUsername)) {
    throw new Error("Username must be 3-24 characters using letters, numbers, or underscores.");
  }

  const existingUser = await users.findOne({ username: normalizedUsername });
  if (existingUser) {
    throw new Error("That username is already taken.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await users.insertOne({
    _id: new ObjectId(),
    username: normalizedUsername,
    passwordHash,
    role: "user",
    createdAt: new Date(),
  });
}

export async function signIn(username: string, password: string) {
  await ensureAdminUser();

  const db = await getDb();
  const user = await db
    .collection<AppUser>("users")
    .findOne({ username: normalizeUsername(username) });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new Error("Invalid username or password.");
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + sessionDurationMs);

  await db.collection<AppSession>("sessions").insertOne({
    _id: new ObjectId(),
    token,
    userId: user._id,
    expiresAt,
    createdAt: new Date(),
  });

  (await cookies()).set(sessionCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

export async function signOut() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;

  if (token) {
    const db = await getDb();
    await db.collection<AppSession>("sessions").deleteOne({ token });
  }

  cookieStore.delete(sessionCookieName);
}

export async function getCurrentUser() {
  const token = (await cookies()).get(sessionCookieName)?.value;
  if (!token) return null;

  const db = await getDb();
  const session = await db
    .collection<AppSession>("sessions")
    .findOne({ token, expiresAt: { $gt: new Date() } });

  if (!session) return null;

  const user = await db.collection<AppUser>("users").findOne({ _id: session.userId });
  if (!user) return null;

  return {
    id: user._id.toString(),
    username: user.username,
    role: user.role ?? "user",
    isAdmin: user.role === "admin",
  };
}
