export type AppSettings = {
  siteName: string;
  siteTitle: string;
  heroHeading: string;
  heroSubheading: string;
  metaKeywords: string;
  metaDescription: string;
  metaAuthor: string;
  supportEmail: string;
  defaultMailboxExpiryMinutes: number;
  maxMailboxMessages: number;
  randomLocalPartMinLength: number;
  randomLocalPartMaxLength: number;
  expiredMailboxRetentionDays: number;
  allowPublicMailboxCreation: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  reservedLocalParts: string[];
};

export type PublicSettings = Pick<
  AppSettings,
  | "siteName"
  | "siteTitle"
  | "heroHeading"
  | "heroSubheading"
  | "metaKeywords"
  | "metaDescription"
  | "metaAuthor"
  | "supportEmail"
  | "randomLocalPartMinLength"
  | "randomLocalPartMaxLength"
  | "maintenanceMode"
  | "maintenanceMessage"
>;

export type UpdateSettingsInput = Partial<AppSettings>;
