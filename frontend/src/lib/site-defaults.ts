import type { PublicSettings } from "@/types/settings";

export const SITE_URL = "https://swiftboxies.com/";

export const SITE_DEFAULTS: Pick<
  PublicSettings,
  | "siteName"
  | "siteTitle"
  | "heroHeading"
  | "heroSubheading"
  | "metaKeywords"
  | "metaDescription"
  | "metaAuthor"
> = {
  siteName: "Swift Inbox",
  siteTitle: "Swift Inbox - Free Temporary Email",
  heroHeading: "Free Temporary Email",
  heroSubheading: "Free, fast, private temporary email address.",
  metaKeywords: "temporary email,temp mail,disposable email,free email,privacy inbox",
  metaDescription:
    "Swift Inbox provides fast, private temporary email addresses for signups, verification codes, and short-lived inboxes.",
  metaAuthor: "NAMINC",
};
