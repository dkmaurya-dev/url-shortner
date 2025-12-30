"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateShortCode = void 0;
const nanoid_1 = require("nanoid");
const generateShortCode = () => (0, nanoid_1.nanoid)(7);
exports.generateShortCode = generateShortCode;
