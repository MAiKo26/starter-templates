import { cors } from "hono/cors";

import { env } from "@/env";

const allowedOrigins = env.CORS_ALLOWED_ORIGINS.split(",").map((o) => o.trim());

export const corsMiddleware = cors({
  origin: allowedOrigins,
  credentials: true,
  allowHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  exposeHeaders: ["Content-Length", "X-Request-ID"],
  maxAge: 86400,
});
