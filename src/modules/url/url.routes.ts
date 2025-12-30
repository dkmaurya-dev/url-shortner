import { Router } from "express";
import express from "express";
import { createShortUrl, getAllUrls, redirectToLongUrl } from "./url.controller";
import { rateLimiter } from "../../middlewares/rateLimit.middleware";
const router = Router();

router.post("/",rateLimiter("create",2,60),createShortUrl);
router.get("/", getAllUrls);

export default router;
