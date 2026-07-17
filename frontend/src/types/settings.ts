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

export type PublicSettings = Pick<
  AppSettings,
  | "siteName"
  | "supportEmail"
  | "randomLocalPartMinLength"
  | "randomLocalPartMaxLength"
  | "maintenanceMode"
  | "maintenanceMessage"
>;

export type UpdateSettingsInput = Partial<AppSettings>;
