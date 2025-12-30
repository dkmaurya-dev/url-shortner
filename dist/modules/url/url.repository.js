"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UrlRepository = void 0;
const prisma_1 = require("../../config/prisma");
class UrlRepository {
    create(data) {
        return prisma_1.prisma.url.create({ data });
    }
    findByShortCode(shortCode) {
        return prisma_1.prisma.url.findUnique({ where: { shortCode } });
    }
    async incrementClickCount(shortCode) {
        return prisma_1.prisma.url.update({
            where: { shortCode },
            data: { clickCount: { increment: 1 } },
        });
    }
    findMany() {
        return prisma_1.prisma.url.findMany();
    }
}
exports.UrlRepository = UrlRepository;
