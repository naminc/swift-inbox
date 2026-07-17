import prisma from "../src/configs/prisma";
import { DEFAULT_SETTINGS } from "../src/services/settings.service";

async function main() {
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
  }

  const domainCount = await prisma.domain.count();
  if (domainCount === 0) {
    await prisma.domain.create({
      data: {
        name: "example.com",
        label: "Example Domain",
        isActive: true,
        isDefault: true
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async error => {
    await prisma.$disconnect();
    throw error;
  });
