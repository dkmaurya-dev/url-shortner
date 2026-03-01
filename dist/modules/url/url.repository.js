"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UrlRepository = void 0;
const prisma_1 = require("../../config/prisma");
class UrlRepository {
    async create(data) {
        return prisma_1.prisma.url.create({ data });
    }
    async findByShortCode(shortCode) {
        return prisma_1.prisma.url.findUnique({
            where: { shortCode },
            include: { analytics: true }
        });
    }
    async findByCustomAlias(customAlias) {
        return prisma_1.prisma.url.findUnique({ where: { customAlias } });
    }
    async updateShortCode(id, shortCode) {
        return prisma_1.prisma.url.update({
            where: { id },
            data: { shortCode },
        });
    }
    async incrementClickCount(shortCode) {
        return prisma_1.prisma.url.update({
            where: { shortCode },
            data: { clickCount: { increment: 1 } },
        });
    }
    async findMany() {
        return prisma_1.prisma.url.findMany({
            orderBy: { createdAt: "desc" },
            include: { _count: { select: { analytics: true } } }
        });
    }
}
exports.UrlRepository = UrlRepository;
