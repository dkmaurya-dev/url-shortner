import { Router } from "express";
import { getAnalytics } from "./analytics.controller";

const router = Router();

router.get("/:shortCode", getAnalytics);

export default router;
