import type { Dispatch, SetStateAction } from "react";

import type { AppSettings } from "@/types/settings";

export type SettingsSectionProps = {
  settings: AppSettings;
  setSettings: Dispatch<SetStateAction<AppSettings>>;
};
