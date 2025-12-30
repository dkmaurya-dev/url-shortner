import { UrlRepository } from "./url.repository";
import { generateShortCode } from "../../utils/nanoid";
  import { redis } from "../../config/redis";
import { logger } from "../../utils/logger";


export class UrlService {
  private repo = new UrlRepository();

  async createShortUrl(longUrl: string, customAlias?: string) {
    const shortCode = customAlias || generateShortCode();

    return this.repo.create({
      shortCode,
      longUrl
    });
  }
  async getAllUrls() {
    return this.repo.findMany();
  }
  async incrementClicks(shortCode: string) {
  await this.repo.incrementClickCount(shortCode);
}


async getLongUrl(shortCode: string) {
  logger.info(`🔍 Looking for ${shortCode}`);
  // 1️⃣ Check cache
  const cachedUrl = await redis.get(shortCode);
  if (cachedUrl) {
    return { longUrl: cachedUrl, fromCache: true };
  }

  // 2️⃣ DB fallback
  const record = await this.repo.findByShortCode(shortCode);
  if (!record) return null;

  // 3️⃣ Save to cache
  await redis.set(shortCode, record.longUrl, "EX", 60 * 60);

  return { longUrl: record.longUrl, fromCache: false };
}

}
