"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUrlSchema = void 0;
const zod_1 = require("zod");
exports.createUrlSchema = zod_1.z.object({
    longUrl: zod_1.z.string().url(),
    customAlias: zod_1.z.string().min(3).max(100).regex(/^[a-zA-Z0-9\/\-]+$/, "Only letters, numbers, slashes, and hyphens are allowed").optional()
});
