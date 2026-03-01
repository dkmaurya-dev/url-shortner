import { Router } from "express";
import { createShortUrl, getAllUrls } from "./url.controller";
import { rateLimiter } from "../../middlewares/rateLimit.middleware";

const router = Router();

router.post("/shorten", rateLimiter("create", 5, 60), createShortUrl);
router.get("/list", getAllUrls);

export default router;
