import prisma from "../configs/prisma";
import { ApiError } from "../utils/api-error";

type CreateDomainInput = {
  name: string;
  isActive?: boolean;
  isDefault?: boolean;
  label?: string | null;
};

type UpdateDomainInput = Partial<CreateDomainInput>;

export async function listDomains() {
  return prisma.domain.findMany({
    orderBy: [{ isDefault: "desc" }, { name: "asc" }]
  });
}

export async function listPublicDomains() {
  return prisma.domain.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      label: true,
      isDefault: true
    },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }]
  });
}

export async function getDomainById(id: number) {
  const domain = await prisma.domain.findUnique({ where: { id } });

  if (!domain) {
    throw ApiError.notFound("Domain not found");
  }

  return domain;
}

export async function createDomain(input: CreateDomainInput) {
  const existing = await prisma.domain.findUnique({
    where: { name: input.name }
  });

  if (existing) {
    throw ApiError.conflict("Domain already exists");
  }

  if (input.isDefault) {
    return prisma.$transaction(async tx => {
      await tx.domain.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      });

      return tx.domain.create({
        data: {
          name: input.name,
          isActive: input.isActive ?? true,
          isDefault: true,
          label: input.label ?? null
        }
      });
    });
  }

  return prisma.domain.create({
    data: {
      name: input.name,
      isActive: input.isActive ?? true,
      isDefault: input.isDefault ?? false,
      label: input.label ?? null
    }
  });
}

export async function updateDomain(id: number, input: UpdateDomainInput) {
  await getDomainById(id);

  if (input.name) {
    const existing = await prisma.domain.findUnique({
      where: { name: input.name }
    });

    if (existing && existing.id !== id) {
      throw ApiError.conflict("Domain already exists");
    }
  }

  const data = {
    ...(input.name !== undefined && { name: input.name }),
    ...(input.isActive !== undefined && { isActive: input.isActive }),
    ...(input.isDefault !== undefined && { isDefault: input.isDefault }),
    ...(input.label !== undefined && { label: input.label })
  };

  if (input.isDefault) {
    return prisma.$transaction(async tx => {
      await tx.domain.updateMany({
        where: {
          id: { not: id },
          isDefault: true
        },
        data: { isDefault: false }
      });

      return tx.domain.update({
        where: { id },
        data
      });
    });
  }

  return prisma.domain.update({
    where: { id },
    data
  });
}

export async function deleteDomain(id: number) {
  await getDomainById(id);

  const mailboxCount = await prisma.mailbox.count({
    where: { domainId: id }
  });

  if (mailboxCount > 0) {
    throw ApiError.conflict(
      "Cannot delete a domain that still has mailboxes. Delete those mailboxes first."
    );
  }

  await prisma.domain.delete({ where: { id } });
}
