import { z } from "@hono/zod-openapi";

import { PaginationMetaSchema, PaginationQuerySchema } from "@/core/pagination";

export const ProjectSchema = z.object({
  id: z.string().uuid().openapi({ description: "Project ID" }),
  name: z
    .string()
    .openapi({ description: "Project name", example: "Website Redesign" }),
  description: z
    .string()
    .nullable()
    .openapi({
      description: "Project description",
      example: "Complete overhaul",
    }),
  status: z
    .string()
    .openapi({ description: "Project status", example: "active" }),
  ownerId: z
    .string()
    .uuid()
    .nullable()
    .openapi({ description: "Owner user ID" }),
  createdAt: z
    .string()
    .datetime()
    .openapi({ description: "Creation timestamp" }),
  updatedAt: z
    .string()
    .datetime()
    .openapi({ description: "Last update timestamp" }),
});

export const ProjectCreateSchema = z.object({
  name: z.string().min(1).max(255).openapi({
    description: "Project name",
    example: "Website Redesign",
  }),
  description: z.string().max(1000).optional().openapi({
    description: "Project description",
    example: "Complete overhaul of the company website",
  }),
  status: z
    .enum(["active", "planning", "completed", "archived"])
    .optional()
    .default("active")
    .openapi({
      description: "Project status",
      example: "active",
    }),
});

export const ProjectUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional().openapi({
    description: "Project name",
  }),
  description: z.string().max(1000).nullable().optional().openapi({
    description: "Project description",
  }),
  status: z
    .enum(["active", "planning", "completed", "archived"])
    .optional()
    .openapi({
      description: "Project status",
    }),
});

export const ProjectListQuerySchema = z
  .object({
    search: z.string().optional().openapi({
      description: "Search by name",
    }),
    status: z.string().optional().openapi({
      description: "Filter by status",
    }),
  })
  .merge(PaginationQuerySchema);

export const ProjectListResponseSchema = z.object({
  data: z.array(ProjectSchema),
  meta: PaginationMetaSchema,
});
