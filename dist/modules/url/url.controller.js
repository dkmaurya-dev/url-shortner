"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redirectToLongUrl = exports.getAllUrls = exports.createShortUrl = void 0;
const url_services_1 = require("./url.services");
const url_schema_1 = require("./url.schema");
const service = new url_services_1.UrlService();
const createShortUrl = async (req, res) => {
    try {
        const body = url_schema_1.createUrlSchema.parse(req.body);
        const result = await service.createShortUrl(body.longUrl, body.customAlias);
        res.status(201).json({
            id: result.id.toString(),
            shortCode: result.shortCode,
            longUrl: result.longUrl,
            shortUrl: `${req.protocol}://${req.get("host")}/${result.shortCode}`
        });
    }
    catch (error) {
        res.status(400).json({ error: error.message || error });
    }
};
exports.createShortUrl = createShortUrl;
const getAllUrls = async (req, res) => {
    try {
        const result = await service.getAllUrls();
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({ error: error });
    }
};
exports.getAllUrls = getAllUrls;
const redirectToLongUrl = async (req, res) => {
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
exports.redirectToLongUrl = redirectToLongUrl;
