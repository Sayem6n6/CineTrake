import "server-only";

import { getCurrentUser, type AppUser } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { AdSettings, AdminUserSummary } from "@/lib/types";

type SiteSettingsDocument = {
  key: "ads";
  globalAdsDisabled: boolean;
  updatedAt: Date;
};

type UserAdSettingsDocument = {
  userId: string;
  adsDisabled: boolean;
  updatedAt: Date;
};

export async function areAdsEnabledForCurrentUser() {
  const db = await getDb();
  const user = await getCurrentUser();
  const siteSettings = await db
    .collection<SiteSettingsDocument>("site_settings")
    .findOne({ key: "ads" });

  if (siteSettings?.globalAdsDisabled) return false;
  if (!user) return true;

  const userSettings = await db
    .collection<UserAdSettingsDocument>("ad_user_settings")
    .findOne({ userId: user.id });

  return !userSettings?.adsDisabled;
}

export async function getAdSettings(): Promise<AdSettings> {
  const db = await getDb();
  const siteSettings = await db
    .collection<SiteSettingsDocument>("site_settings")
    .findOne({ key: "ads" });
  const userSettings = await db
    .collection<UserAdSettingsDocument>("ad_user_settings")
    .find({})
    .toArray();
  const disabledByUserId = new Map(
    userSettings.map((setting) => [setting.userId, setting.adsDisabled]),
  );
  const users = await db
    .collection<AppUser>("users")
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  return {
    globalAdsDisabled: Boolean(siteSettings?.globalAdsDisabled),
    users: users.map((user): AdminUserSummary => ({
      id: user._id.toString(),
      username: user.username,
      role: user.role ?? "user",
      adsDisabled: Boolean(disabledByUserId.get(user._id.toString())),
      createdAt: user.createdAt.toISOString(),
    })),
  };
}

export async function setGlobalAdsDisabled(disabled: boolean) {
  const db = await getDb();
  await db.collection<SiteSettingsDocument>("site_settings").updateOne(
    { key: "ads" },
    {
      $set: {
        key: "ads",
        globalAdsDisabled: disabled,
        updatedAt: new Date(),
      },
    },
    { upsert: true },
  );
}

export async function setUserAdsDisabled(userId: string, disabled: boolean) {
  const db = await getDb();
  await db.collection<UserAdSettingsDocument>("ad_user_settings").updateOne(
    { userId },
    {
      $set: {
        userId,
        adsDisabled: disabled,
        updatedAt: new Date(),
      },
    },
    { upsert: true },
  );
}
