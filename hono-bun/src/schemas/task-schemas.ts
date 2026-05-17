import { z } from "@hono/zod-openapi";

import { PaginationMetaSchema, PaginationQuerySchema } from "@/core/pagination";

export const TaskSchema = z.object({
  id: z.string().uuid().openapi({ description: "Task ID" }),
  projectId: z.string().uuid().openapi({ description: "Parent project ID" }),
  title: z
    .string()
    .openapi({ description: "Task title", example: "Design homepage" }),
  description: z
    .string()
    .nullable()
    .openapi({ description: "Task description" }),
  status: z.string().openapi({ description: "Task status", example: "todo" }),
  priority: z
    .string()
    .openapi({ description: "Task priority", example: "high" }),
  assigneeId: z
    .string()
    .uuid()
    .nullable()
    .openapi({ description: "Assignee user ID" }),
  dueDate: z
    .string()
    .datetime()
    .nullable()
    .openapi({ description: "Due date" }),
  createdAt: z
    .string()
    .datetime()
    .openapi({ description: "Creation timestamp" }),
  updatedAt: z
    .string()
    .datetime()
    .openapi({ description: "Last update timestamp" }),
});

export const TaskCreateSchema = z.object({
  title: z.string().min(1).max(255).openapi({
    description: "Task title",
    example: "Design homepage mockup",
  }),
  description: z.string().max(2000).optional().openapi({
    description: "Task description",
  }),
  status: z
    .enum(["todo", "in_progress", "done", "cancelled"])
    .optional()
    .default("todo")
    .openapi({
      description: "Task status",
    }),
  priority: z
    .enum(["low", "medium", "high", "urgent"])
    .optional()
    .default("medium")
    .openapi({
      description: "Task priority",
    }),
  assigneeId: z.string().uuid().nullable().optional().openapi({
    description: "Assignee user ID",
  }),
  dueDate: z.string().datetime().nullable().optional().openapi({
    description: "Due date (ISO 8601)",
  }),
});

export const TaskUpdateSchema = z.object({
  title: z.string().min(1).max(255).optional().openapi({
    description: "Task title",
  }),
  description: z.string().max(2000).nullable().optional().openapi({
    description: "Task description",
  }),
  status: z
    .enum(["todo", "in_progress", "done", "cancelled"])
    .optional()
    .openapi({
      description: "Task status",
    }),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional().openapi({
    description: "Task priority",
  }),
  assigneeId: z.string().uuid().nullable().optional().openapi({
    description: "Assignee user ID",
  }),
  dueDate: z.string().datetime().nullable().optional().openapi({
    description: "Due date (ISO 8601)",
  }),
});

export const TaskListQuerySchema = z
  .object({
    status: z.string().optional().openapi({
      description: "Filter by status",
    }),
    priority: z.string().optional().openapi({
      description: "Filter by priority",
    }),
    assigneeId: z.string().uuid().optional().openapi({
      description: "Filter by assignee",
    }),
  })
  .merge(PaginationQuerySchema);

export const TaskListResponseSchema = z.object({
  data: z.array(TaskSchema),
  meta: PaginationMetaSchema,
});
