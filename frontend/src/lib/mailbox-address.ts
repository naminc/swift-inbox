const WORD_SEEDS = [
  "swift",
  "nova",
  "luna",
  "milo",
  "kairo",
  "nori",
  "zento",
  "lunar",
  "pixel",
  "orbit",
  "signal",
  "tempo",
  "mail",
  "drop",
  "inbox",
  "mint",
  "raven",
  "cloud",
  "echo",
  "zen",
  "byte",
];

const ALPHABET = "abcdefghijklmnopqrstuvwxyz";
const DIGITS = "0123456789";
const SAFE_CHARS = `${ALPHABET}${DIGITS}`;

export const DEFAULT_RANDOM_LOCAL_PART_MIN_LENGTH = 6;
export const DEFAULT_RANDOM_LOCAL_PART_MAX_LENGTH = 10;

type RandomLocalPartOptions = {
  minLength?: number;
  maxLength?: number;
};

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChars(length: number) {
  return Array.from({ length }, () => SAFE_CHARS[randomInt(0, SAFE_CHARS.length - 1)]).join("");
}

function randomTargetLength(minLength: number, maxLength: number) {
  const safeMin = Math.max(3, Math.min(32, minLength));
  const safeMax = Math.max(safeMin, Math.min(32, maxLength));

  return randomInt(safeMin, safeMax);
}

export function randomLocalPart(options: RandomLocalPartOptions = {}) {
  const targetLength = randomTargetLength(
    options.minLength ?? DEFAULT_RANDOM_LOCAL_PART_MIN_LENGTH,
    options.maxLength ?? DEFAULT_RANDOM_LOCAL_PART_MAX_LENGTH,
  );
  const seed = WORD_SEEDS[randomInt(0, WORD_SEEDS.length - 1)];
  const base = seed.slice(0, Math.min(seed.length, targetLength));

  if (base.length === targetLength) return base;

  return `${base}${randomChars(targetLength - base.length)}`;
}

export function normalizeLocalPart(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9._-]/g, "")
    .slice(0, 32);
}

export function formatMailboxAddress(localPart: string, domain: string) {
  return domain ? `${localPart || "inbox"}@${domain}` : localPart || "inbox";
}

export function parseMailboxAddress(address: string) {
  const [localPart, ...domainParts] = address.split("@");
  const domain = domainParts.join("@");

  if (!localPart || !domain) return null;

  return {
    localPart,
    domain,
  };
}
