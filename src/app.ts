import express from "express";
import { env } from "./config/env";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import urlRoutes from "./modules/url/url.routes";
import { redirectToLongUrl } from "./modules/url/url.controller";
import { prisma } from "./config/prisma";

export const app = express();
 app.use(helmet());
 app.use(express.json());
 app.use(cors())


 app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again after an hour",
    standardHeaders: true, // return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
 }))

app.use("/api/v1/urls", urlRoutes);
app.get("/:shortCode", redirectToLongUrl);
app.set("trust proxy", 1);

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

app.get("/health",(_,res)=>{res.send("OK")})