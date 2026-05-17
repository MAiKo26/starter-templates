import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";

import type { HonoEnv } from "@/core/hono-env";
import { ErrorSchema } from "@/schemas/common-schemas";
import {
  TaskCreateSchema,
  TaskListQuerySchema,
  TaskListResponseSchema,
  TaskSchema,
  TaskUpdateSchema,
} from "@/schemas/task-schemas";
import { taskService } from "@/services/task-service";

const taskRoutes = new OpenAPIHono<HonoEnv>();

const listTasks = createRoute({
  method: "get",
  path: "/projects/{projectId}/tasks",
  tags: ["Tasks"],
  summary: "List tasks for a project",
  request: {
    params: z.object({ projectId: z.string().uuid() }),
    query: TaskListQuerySchema,
  },
  responses: {
    200: {
      description: "List of tasks",
      content: { "application/json": { schema: TaskListResponseSchema } },
    },
  },
});

taskRoutes.openapi(listTasks, async (c) => {
  const { projectId } = c.req.valid("param");
  const query = c.req.valid("query");
  const { items, meta } = await taskService.list({
    projectId,
    status: query.status,
    priority: query.priority,
    assigneeId: query.assigneeId,
    limit: query.limit,
    offset: query.offset,
  });
  return c.json(
    {
      data: items.map((t) => ({
        id: t.id,
        projectId: t.projectId,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        assigneeId: t.assigneeId,
        dueDate: t.dueDate?.toISOString() ?? null,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      })),
      meta,
    },
    200,
  );
});

const getTask = createRoute({
  method: "get",
  path: "/projects/{projectId}/tasks/{id}",
  tags: ["Tasks"],
  summary: "Get task by ID",
  request: {
    params: z.object({
      projectId: z.string().uuid(),
      id: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: "Task detail",
      content: { "application/json": { schema: TaskSchema } },
    },
    404: {
      description: "Not found",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

taskRoutes.openapi(getTask, async (c) => {
  const { id } = c.req.valid("param");
  const t = await taskService.findById(id);
  return c.json(
    {
      id: t.id,
      projectId: t.projectId,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      assigneeId: t.assigneeId,
      dueDate: t.dueDate?.toISOString() ?? null,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    },
    200,
  );
});

const createTask = createRoute({
  method: "post",
  path: "/projects/{projectId}/tasks",
  tags: ["Tasks"],
  summary: "Create a task",
  request: {
    params: z.object({ projectId: z.string().uuid() }),
    body: {
      content: { "application/json": { schema: TaskCreateSchema } },
    },
  },
  responses: {
    201: {
      description: "Created",
      content: { "application/json": { schema: TaskSchema } },
    },
  },
});

taskRoutes.openapi(createTask, async (c) => {
  const { projectId } = c.req.valid("param");
  const body = c.req.valid("json");
  const t = await taskService.create({
    projectId,
    title: body.title,
    description: body.description,
    status: body.status,
    priority: body.priority,
    assigneeId: body.assigneeId,
    dueDate: body.dueDate,
  });
  return c.json(
    {
      id: t.id,
      projectId: t.projectId,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      assigneeId: t.assigneeId,
      dueDate: t.dueDate?.toISOString() ?? null,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    },
    201,
  );
});

const updateTask = createRoute({
  method: "patch",
  path: "/projects/{projectId}/tasks/{id}",
  tags: ["Tasks"],
  summary: "Update a task",
  request: {
    params: z.object({
      projectId: z.string().uuid(),
      id: z.string().uuid(),
    }),
    body: {
      content: { "application/json": { schema: TaskUpdateSchema } },
    },
  },
  responses: {
    200: {
      description: "Updated",
      content: { "application/json": { schema: TaskSchema } },
    },
    404: {
      description: "Not found",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

taskRoutes.openapi(updateTask, async (c) => {
  const { id } = c.req.valid("param");
  const body = c.req.valid("json");
  const t = await taskService.update(id, body);
  return c.json(
    {
      id: t.id,
      projectId: t.projectId,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      assigneeId: t.assigneeId,
      dueDate: t.dueDate?.toISOString() ?? null,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    },
    200,
  );
});

const deleteTask = createRoute({
  method: "delete",
  path: "/projects/{projectId}/tasks/{id}",
  tags: ["Tasks"],
  summary: "Delete a task",
  request: {
    params: z.object({
      projectId: z.string().uuid(),
      id: z.string().uuid(),
    }),
  },
  responses: {
    204: { description: "Deleted" },
    404: {
      description: "Not found",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

taskRoutes.openapi(deleteTask, async (c) => {
  const { id } = c.req.valid("param");
  await taskService.delete(id);
  return new Response(null, { status: 204 });
});

export default taskRoutes;
