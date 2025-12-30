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
            shortUrl: `http://localhost:3000/${result.shortCode}`
        });
    }
    catch (error) {
        res.status(400).json({ error: error });
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
    const result = await service.getLongUrl(shortCode);
    console.log(result);
    if (!result) {
        return res.status(404).json({ message: "URL not found" });
    }
    // 🔥 Async click tracking (fire & forget)
    service
        .incrementClicks(shortCode)
        .catch(() => { }); // never block redirect
    return res.redirect(result.longUrl);
};
exports.redirectToLongUrl = redirectToLongUrl;
