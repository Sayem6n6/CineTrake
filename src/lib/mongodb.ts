import "server-only";

import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "cinetrake";

if (!uri) {
  throw new Error("Missing MONGODB_URI in .env.local.");
}

const globalForMongo = globalThis as unknown as {
  mongoClient?: MongoClient;
  mongoClientPromise?: Promise<MongoClient>;
  mongoIndexesPromise?: Promise<void>;
};

const client =
  globalForMongo.mongoClient ??
  new MongoClient(uri, {
    retryWrites: true,
  });

if (!globalForMongo.mongoClientPromise) {
  globalForMongo.mongoClient = client;
  globalForMongo.mongoClientPromise = client.connect();
}

export async function getDb(): Promise<Db> {
  const connectedClient = await globalForMongo.mongoClientPromise!;
  const db = connectedClient.db(dbName);

  if (!globalForMongo.mongoIndexesPromise) {
    globalForMongo.mongoIndexesPromise = Promise.all([
      db.collection("users").createIndex({ username: 1 }, { unique: true }),
      db.collection("sessions").createIndex({ token: 1 }, { unique: true }),
      db.collection("sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      db
        .collection("watchlist_movies")
        .createIndex({ user_id: 1, tmdb_id: 1 }, { unique: true }),
      db.collection("movie_votes").createIndex({ movieId: 1, userId: 1 }, { unique: true }),
      db.collection("movie_votes").createIndex({ movieId: 1, vote: 1 }),
      db.collection("movie_comments").createIndex({ movieId: 1, createdAt: -1 }),
      db.collection("blog_posts").createIndex({ slug: 1 }, { unique: true }),
      db.collection("blog_posts").createIndex({ status: 1, createdAt: -1 }),
      db.collection("blog_posts").createIndex({ authorId: 1, createdAt: -1 }),
      db.collection("ad_user_settings").createIndex({ userId: 1 }, { unique: true }),
    ]).then(() => undefined);
  }

  await globalForMongo.mongoIndexesPromise;

  return db;
}
