import { Prisma } from "@prisma/client";
import prisma from "../configs/prisma";
import { ApiError } from "../utils/api-error";

export type AppSettings = {
  siteName: string;
  supportEmail: string;
  defaultMailboxExpiryMinutes: number;
  maxMailboxMessages: number;
  randomLocalPartMinLength: number;
  randomLocalPartMaxLength: number;
  allowPublicMailboxCreation: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string;
};

export const DEFAULT_SETTINGS: AppSettings = {
  siteName: "Swift Inbox",
  supportEmail: "support@example.com",
  defaultMailboxExpiryMinutes: 60,
  maxMailboxMessages: 100,
  randomLocalPartMinLength: 6,
  randomLocalPartMaxLength: 10,
  allowPublicMailboxCreation: true,
  maintenanceMode: false,
  maintenanceMessage:
    "Swift Inbox is under maintenance. Existing inboxes can be viewed, but new addresses and mailbox changes are paused."
};

const settingKeys = Object.keys(DEFAULT_SETTINGS) as Array<keyof AppSettings>;

const CACHE_TTL_MS = 15_000;
let settingsCache: { value: AppSettings; expiresAt: number } | null = null;

function invalidateSettingsCache() {
  settingsCache = null;
}

function isSettingKey(value: string): value is keyof AppSettings {
  return settingKeys.includes(value as keyof AppSettings);
}

function normalizeValue<Key extends keyof AppSettings>(
  key: Key,
  value: Prisma.JsonValue
): AppSettings[Key] {
  const fallback = DEFAULT_SETTINGS[key];

  if (typeof fallback === "string") {
    return (typeof value === "string" ? value : fallback) as AppSettings[Key];
  }

  if (typeof fallback === "number") {
    return (typeof value === "number" ? value : fallback) as AppSettings[Key];
  }

  return (typeof value === "boolean" ? value : fallback) as AppSettings[Key];
}

async function fetchSettings(): Promise<AppSettings> {
  const rows = await prisma.setting.findMany({
    where: {
      key: {
        in: settingKeys
      }
    }
  });

  const settings: AppSettings = { ...DEFAULT_SETTINGS };

  rows.forEach(row => {
    if (isSettingKey(row.key)) {
      settings[row.key] = normalizeValue(row.key, row.value) as never;
    }
  });

  return settings;
}

export async function getSettings(): Promise<AppSettings> {
  if (settingsCache && Date.now() < settingsCache.expiresAt) {
    return settingsCache.value;
  }

  const settings = await fetchSettings();

  settingsCache = { value: settings, expiresAt: Date.now() + CACHE_TTL_MS };

  return settings;
}

export async function getPublicSettings() {
  const settings = await getSettings();

  return {
    siteName: settings.siteName,
    supportEmail: settings.supportEmail,
    randomLocalPartMinLength: settings.randomLocalPartMinLength,
    randomLocalPartMaxLength: settings.randomLocalPartMaxLength,
    maintenanceMode: settings.maintenanceMode,
    maintenanceMessage: settings.maintenanceMessage
  };
}

export async function assertMaintenanceModeDisabled() {
  const settings = await getSettings();

  if (settings.maintenanceMode) {
    throw ApiError.serviceUnavailable(settings.maintenanceMessage);
  }

  return settings;
}

export async function updateSettings(input: Partial<AppSettings>) {
  const currentSettings = await getSettings();
  const nextSettings = { ...currentSettings, ...input };

  if (
    nextSettings.randomLocalPartMinLength >
    nextSettings.randomLocalPartMaxLength
  ) {
    throw ApiError.badRequest(
      "Random local part min length must be less than or equal to max length"
    );
  }

  const entries = Object.entries(input) as Array<
    [keyof AppSettings, AppSettings[keyof AppSettings]]
  >;

  await prisma.$transaction(
    entries.map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value }
      })
    )
  );

  invalidateSettingsCache();

  return getSettings();
}

export async function seedDefaultSettings() {
  await updateSettings(DEFAULT_SETTINGS);
}
