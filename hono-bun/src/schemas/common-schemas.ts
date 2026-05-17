import { z } from "@hono/zod-openapi";

export const ErrorSchema = z.object({
  error: z.string().openapi({
    description: "Error message",
    example: "Something went wrong",
  }),
});

export const HealthResponseSchema = z.object({
  status: z.string().openapi({ example: "ok" }),
  timestamp: z.string().datetime().openapi({
    description: "Current server timestamp",
  }),
  services: z.object({
    database: z.string().openapi({ example: "connected" }),
    storage: z.string().openapi({ example: "connected" }),
  }),
});
