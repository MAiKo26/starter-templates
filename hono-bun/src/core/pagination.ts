import { z } from "@hono/zod-openapi";

export const PaginationQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).optional().default(20).openapi({
    description: "Number of items per page",
    example: 20,
  }),
  offset: z.coerce.number().min(0).optional().default(0).openapi({
    description: "Number of items to skip",
    example: 0,
  }),
});

export const PaginationMetaSchema = z.object({
  total: z.number().openapi({ description: "Total item count" }),
  limit: z.number().openapi({ description: "Items per page" }),
  offset: z.number().openapi({ description: "Items skipped" }),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

export function buildPaginationMeta(
  total: number,
  limit: number,
  offset: number,
): PaginationMeta {
  return { total, limit, offset };
}
