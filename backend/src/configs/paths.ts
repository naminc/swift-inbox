import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const CURRENT_DIR = dirname(fileURLToPath(import.meta.url));

function findProjectRoot(startDir: string) {
  let currentDir = startDir;

  while (true) {
    if (existsSync(resolve(currentDir, "package.json"))) {
      return currentDir;
    }

    const parentDir = dirname(currentDir);

    if (parentDir === currentDir) {
      throw new Error("Could not resolve backend project root");
    }

    currentDir = parentDir;
  }
}

export const PROJECT_ROOT = findProjectRoot(CURRENT_DIR);

export function resolveProjectPath(...segments: string[]) {
  return resolve(PROJECT_ROOT, ...segments);
}
