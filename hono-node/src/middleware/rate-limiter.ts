import type { Context } from "hono";
import { rateLimiter as honoRateLimiter } from "hono-rate-limiter";

import type { HonoEnv } from "@/core/hono-env";
import { env } from "@/env";

const keyGenerator = (c: Context<HonoEnv>) => {
  const forwarded = c.req.header("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = c.req.header("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
};

export const rateLimiter = honoRateLimiter<HonoEnv>({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: "draft-6",
  keyGenerator,
  message: () => ({
    error: "Too many requests, please try again later",
  }),
  skip: (c) => c.req.path === "/health",
});
