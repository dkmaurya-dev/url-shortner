import { prisma } from "../../config/prisma";

export class UrlRepository {
  async create(data: { shortCode: string; longUrl: string; customAlias?: string; expiresAt?: Date }) {
    return prisma.url.create({ data });
  }

  async findByShortCode(shortCode: string) {
    return prisma.url.findUnique({
      where: { shortCode },
      include: { analytics: true }
    });
  }

  async findByCustomAlias(customAlias: string) {
    return prisma.url.findUnique({ where: { customAlias } });
  }

  async updateShortCode(id: bigint, shortCode: string) {
    return prisma.url.update({
      where: { id },
      data: { shortCode },
    });
  }

  async incrementClickCount(shortCode: string) {
    return prisma.url.update({
      where: { shortCode },
      data: { clickCount: { increment: 1 } },
    });
  }

  async findMany() {
    return prisma.url.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { analytics: true } } }
    });
  }
}
