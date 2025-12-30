"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const cors_1 = __importDefault(require("cors"));
const url_routes_1 = __importDefault(require("./modules/url/url.routes"));
const url_controller_1 = require("./modules/url/url.controller");
const prisma_1 = require("./config/prisma");
exports.app = (0, express_1.default)();
exports.app.use((0, helmet_1.default)());
exports.app.use(express_1.default.json());
exports.app.use((0, cors_1.default)());
exports.app.use((0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again after an hour",
    standardHeaders: true, // return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
}));
exports.app.use("/api/v1/urls", url_routes_1.default);
exports.app.get("/:shortCode", url_controller_1.redirectToLongUrl);
exports.app.set("trust proxy", 1);
process.on("SIGTERM", async () => {
    await prisma_1.prisma.$disconnect();
    process.exit(0);
});
exports.app.get("/health", (_, res) => { res.send("OK"); });
