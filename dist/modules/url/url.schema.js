"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUrlSchema = void 0;
const zod_1 = require("zod");
exports.createUrlSchema = zod_1.z.object({
    longUrl: zod_1.z.string().url(),
    customAlias: zod_1.z.string().min(4).max(10).optional()
});
