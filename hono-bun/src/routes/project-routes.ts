import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";

import type { HonoEnv } from "@/core/hono-env";
import { ErrorSchema } from "@/schemas/common-schemas";
import {
  ProjectCreateSchema,
  ProjectListQuerySchema,
  ProjectListResponseSchema,
  ProjectSchema,
  ProjectUpdateSchema,
} from "@/schemas/project-schemas";
import { projectService } from "@/services/project-service";

const projectRoutes = new OpenAPIHono<HonoEnv>();

const listProjects = createRoute({
  method: "get",
  path: "/projects",
  tags: ["Projects"],
  summary: "List projects",
  request: { query: ProjectListQuerySchema },
  responses: {
    200: {
      description: "List of projects",
      content: { "application/json": { schema: ProjectListResponseSchema } },
    },
  },
});

projectRoutes.openapi(listProjects, async (c) => {
  const query = c.req.valid("query");
  const { items, meta } = await projectService.list({
    search: query.search,
    status: query.status,
    limit: query.limit,
    offset: query.offset,
  });
  return c.json(
    {
      data: items.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status,
        ownerId: p.ownerId,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
      meta,
    },
    200,
  );
});

const getProject = createRoute({
  method: "get",
  path: "/projects/{id}",
  tags: ["Projects"],
  summary: "Get project by ID",
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: {
    200: {
      description: "Project detail",
      content: { "application/json": { schema: ProjectSchema } },
    },
    404: {
      description: "Not found",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

projectRoutes.openapi(getProject, async (c) => {
  const { id } = c.req.valid("param");
  const p = await projectService.findById(id);
  return c.json(
    {
      id: p.id,
      name: p.name,
      description: p.description,
      status: p.status,
      ownerId: p.ownerId,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    },
    200,
  );
});

const createProject = createRoute({
  method: "post",
  path: "/projects",
  tags: ["Projects"],
  summary: "Create a project",
  request: {
    body: {
      content: { "application/json": { schema: ProjectCreateSchema } },
    },
  },
  responses: {
    201: {
      description: "Created",
      content: { "application/json": { schema: ProjectSchema } },
    },
  },
});

projectRoutes.openapi(createProject, async (c) => {
  const body = c.req.valid("json");
  const p = await projectService.create({
    name: body.name,
    description: body.description,
    status: body.status,
    ownerId: c.get("user")?.id,
  });
  return c.json(
    {
      id: p.id,
      name: p.name,
      description: p.description,
      status: p.status,
      ownerId: p.ownerId,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    },
    201,
  );
});

const updateProject = createRoute({
  method: "patch",
  path: "/projects/{id}",
  tags: ["Projects"],
  summary: "Update a project",
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: {
      content: { "application/json": { schema: ProjectUpdateSchema } },
    },
  },
  responses: {
    200: {
      description: "Updated",
      content: { "application/json": { schema: ProjectSchema } },
    },
    404: {
      description: "Not found",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

projectRoutes.openapi(updateProject, async (c) => {
  const { id } = c.req.valid("param");
  const body = c.req.valid("json");
  const p = await projectService.update(id, body);
  return c.json(
    {
      id: p.id,
      name: p.name,
      description: p.description,
      status: p.status,
      ownerId: p.ownerId,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    },
    200,
  );
});

const deleteProject = createRoute({
  method: "delete",
  path: "/projects/{id}",
  tags: ["Projects"],
  summary: "Delete a project",
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: {
    204: { description: "Deleted" },
    404: {
      description: "Not found",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

projectRoutes.openapi(deleteProject, async (c) => {
  const { id } = c.req.valid("param");
  await projectService.delete(id);
  return new Response(null, { status: 204 });
});

export default projectRoutes;
