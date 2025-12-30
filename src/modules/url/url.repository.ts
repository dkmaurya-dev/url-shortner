import { prisma } from "../../config/prisma";

export class UrlRepository {
  create(data: { shortCode: string; longUrl: string }) {
    return prisma.url.create({ data });
  }

  findByShortCode(shortCode: string) {
    return prisma.url.findUnique({ where: { shortCode } });
  }
  async incrementClickCount(shortCode: string) {
  return prisma.url.update({
    where: { shortCode },
    data: { clickCount: { increment: 1 } },
  });
}

  findMany() {
    return prisma.url.findMany();
  }
}
