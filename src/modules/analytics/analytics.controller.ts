import { Request, Response } from "express";
import { AnalyticsService } from "./analytics.service";

const service = new AnalyticsService();

export const getAnalytics = async (req: Request, res: Response) => {
    const { shortCode } = req.params;
    try {
        const result = await service.getAnalytics(shortCode);
        if (!result) {
            return res.status(404).json({ message: "Analytics not found for this short code" });
        }
        res.json(result);
    } catch (error) {
        console.error("Analytics fetch error:", error);
        res.status(500).json({ error: "Failed to fetch analytics", details: error instanceof Error ? error.message : error });
    }
};
