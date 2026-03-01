import geoip from "geoip-lite";
import { UAParser } from "ua-parser-js";
import { prisma } from "../../config/prisma";
import { logger } from "../../utils/logger";

export class AnalyticsService {
    async trackClick(urlId: bigint, ip: string, userAgent: string, referer: string) {
        try {
            // geoip-lite doesn't work well with 127.0.0.1 or ::1
            const normalizedIp = ip === "::1" || ip === "127.0.0.1" ? "8.8.8.8" : ip;
            const geo = geoip.lookup(normalizedIp);
            const parser = new UAParser(userAgent);
            const uaResult = parser.getResult();

            await prisma.analytics.create({
                data: {
                    urlId,
                    ip: normalizedIp,
                    userAgent,
                    referer: referer || "Direct",
                    country: geo?.country || "Unknown",
                    city: geo?.city || "Unknown",
                    device: uaResult.device.type || "desktop",
                    platform: uaResult.os.name || "Unknown",
                    browser: uaResult.browser.name || "Unknown",
                },
            });

            await prisma.url.update({
                where: { id: urlId },
                data: { clickCount: { increment: 1 } },
            });
        } catch (error) {
            logger.error(error, `Failed to track click for URL ID ${urlId}`);
        }
    }

    async getAnalytics(shortCode: string) {
        const url = await prisma.url.findUnique({
            where: { shortCode },
            include: {
                analytics: {
                    orderBy: { timestamp: "desc" },
                },
            },
        });

        if (!url) return null;

        // Aggregate data
        const totalClicks = url.clickCount;
        const countries = this.aggregate(url.analytics, "country");
        const devices = this.aggregate(url.analytics, "device");
        const browsers = this.aggregate(url.analytics, "browser");
        const platforms = this.aggregate(url.analytics, "platform");

        return {
            shortCode: url.shortCode,
            longUrl: url.longUrl,
            totalClicks,
            breakdown: {
                countries,
                devices,
                browsers,
                platforms,
            },
            recentClicks: url.analytics.slice(0, 10),
        };
    }

    private aggregate(data: any[], key: string) {
        return data.reduce((acc, item) => {
            const val = item[key] || "Unknown";
            acc[val] = (acc[val] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    }
}
