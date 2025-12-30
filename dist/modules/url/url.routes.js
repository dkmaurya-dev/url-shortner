"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const url_controller_1 = require("./url.controller");
const rateLimit_middleware_1 = require("../../middlewares/rateLimit.middleware");
const router = (0, express_1.Router)();
router.post("/", (0, rateLimit_middleware_1.rateLimiter)("create", 2, 60), url_controller_1.createShortUrl);
router.get("/", url_controller_1.getAllUrls);
exports.default = router;
