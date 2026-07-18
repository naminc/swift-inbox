import type { DomainInput } from "@/types/domain";
import type { AppSettings } from "@/types/settings";

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const domainPattern = /^(?!-)(?:[a-z0-9-]{1,63}\.)+[a-z]{2,63}$/;

const CONTACT_MESSAGE_MIN_LENGTH = 10;

export function validateSettingsForm(form: AppSettings): string | null {
  if (!form.siteName) {
    return "Site name is required";
  }

  if (form.siteName.length > 80) {
    return "Site name must be 80 characters or fewer";
  }

  if (!form.siteTitle) {
    return "Site title is required";
  }

  if (form.siteTitle.length > 120) {
    return "Site title must be 120 characters or fewer";
  }

  if (!form.heroHeading) {
    return "Hero heading is required";
  }

  if (form.heroHeading.length > 120) {
    return "Hero heading must be 120 characters or fewer";
  }

  if (!form.heroSubheading) {
    return "Hero subheading is required";
  }

  if (form.heroSubheading.length > 180) {
    return "Hero subheading must be 180 characters or fewer";
  }

  if (!form.metaDescription) {
    return "Meta description is required";
  }

  if (form.metaDescription.length > 300) {
    return "Meta description must be 300 characters or fewer";
  }

  if (!form.metaKeywords) {
    return "Meta keywords are required";
  }

  if (form.metaKeywords.length > 300) {
    return "Meta keywords must be 300 characters or fewer";
  }

  if (!form.metaAuthor) {
    return "Meta author is required";
  }

  if (form.metaAuthor.length > 80) {
    return "Meta author must be 80 characters or fewer";
  }

  if (!emailPattern.test(form.supportEmail)) {
    return "Support email must be valid";
  }

  if (!Number.isInteger(form.defaultMailboxExpiryMinutes) || form.defaultMailboxExpiryMinutes < 1) {
    return "Mailbox expiry must be a positive integer";
  }

  if (!Number.isInteger(form.maxMailboxMessages) || form.maxMailboxMessages < 1) {
    return "Max mailbox messages must be a positive integer";
  }

  if (!Number.isInteger(form.randomLocalPartMinLength) || form.randomLocalPartMinLength < 3) {
    return "Random local part min length must be at least 3";
  }

  if (!Number.isInteger(form.randomLocalPartMaxLength) || form.randomLocalPartMaxLength > 32) {
    return "Random local part max length must be at most 32";
  }

  if (form.randomLocalPartMinLength > form.randomLocalPartMaxLength) {
    return "Random local part min length must be less than or equal to max length";
  }

  if (
    !Number.isInteger(form.expiredMailboxRetentionDays) ||
    form.expiredMailboxRetentionDays < 1 ||
    form.expiredMailboxRetentionDays > 365
  ) {
    return "Expired mailbox retention days must be an integer between 1 and 365";
  }

  if (!form.maintenanceMessage) {
    return "Maintenance message is required";
  }

  if (form.maintenanceMessage.length > 240) {
    return "Maintenance message must be 240 characters or fewer";
  }

  return null;
}

export function validateDomainInput(input: DomainInput): string | null {
  if (!input.name) {
    return "Domain name is required";
  }

  if (!domainPattern.test(input.name)) {
    return "Enter a valid domain, for example mailbox.one";
  }

  return null;
}

export function validateContactForm(input: { email: string; message: string }): string | null {
  if (input.email && !emailPattern.test(input.email)) {
    return "Enter a valid email address or leave it blank.";
  }

  if (input.message.length < CONTACT_MESSAGE_MIN_LENGTH) {
    return "Message must be at least 10 characters.";
  }

  return null;
}
