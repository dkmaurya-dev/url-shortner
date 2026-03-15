import express from "express";
import path from "path";
import { env } from "./config/env";

import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import urlRoutes from "./modules/url/url.routes";
import analyticsRoutes from "./modules/analytics/analytics.routes";
import { redirectToLongUrl } from "./modules/url/url.controller";
import { prisma } from "./config/prisma";
import "./utils/json_polyfill";

export const app = express();
app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],

        scriptSrc: [
          "'self'",
          "https://cdn.jsdelivr.net",
          "https://kit.fontawesome.com",
          "https://ka-f.fontawesome.com"
        ],

        scriptSrcElem: [
          "'self'",
          "https://cdn.jsdelivr.net",
          "https://kit.fontawesome.com",
          "https://ka-f.fontawesome.com"
        ],

        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com"
        ],

        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com"
        ],

        imgSrc: [
          "'self'",
          "data:",
          "https:"
        ],

        connectSrc: [
          "'self'",
          "https://cdn.jsdelivr.net",
          "https://ka-f.fontawesome.com"
        ],

        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  })
);
app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, "..", "public")));



app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after an hour",
  standardHeaders: true, // return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
}))

app.use("/api/v1/urls", urlRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.get("/:shortCode", redirectToLongUrl);


process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

app.get("/health", (_, res) => { res.send("OK") })