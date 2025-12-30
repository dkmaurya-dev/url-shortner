import { Request, Response } from "express";
import { UrlService } from "./url.services";
import { createUrlSchema } from "./url.schema";

const service = new UrlService();

export const createShortUrl = async (req: Request, res: Response) => {
  try {
  const body = createUrlSchema.parse(req.body);
  
  const result = await service.createShortUrl(
    body.longUrl,
    body.customAlias
  );

  res.status(201).json({
    shortUrl: `http://localhost:3000/${result.shortCode}`
  });
} catch (error) {
  res.status(400).json({ error: error });
}
};

export const getAllUrls = async (req: Request, res: Response) => {
  try {
    const result = await service.getAllUrls();
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error });
  }
};

export const redirectToLongUrl = async (req: Request, res: Response) => {
  const { shortCode } = req.params;

  const result = await service.getLongUrl(shortCode);
   console.log(result)
  if (!result) {
    return res.status(404).json({ message: "URL not found" });
  }

  // 🔥 Async click tracking (fire & forget)
  service
    .incrementClicks(shortCode)
    .catch(() => {}); // never block redirect

  return res.redirect(result.longUrl);
};
