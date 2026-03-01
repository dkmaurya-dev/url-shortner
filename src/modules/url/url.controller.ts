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
      id: result.id.toString(),
      shortCode: result.shortCode,
      longUrl: result.longUrl,
      shortUrl: `${req.protocol}://${req.get("host")}/${result.shortCode}`
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || error });
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

  const trackingData = {
    ip: req.ip || "unknown",
    ua: req.get("user-agent") || "unknown",
    referer: req.get("referer") || "Direct"
  };

  const result = await service.getLongUrl(shortCode, trackingData);

  if (!result) {
    return res.status(404).json({ message: "URL not found" });
  }

  return res.redirect(result.longUrl);
};
