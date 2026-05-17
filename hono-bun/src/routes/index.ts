import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";

import type { HonoEnv } from "@/core/hono-env";
import attachmentRoutes from "@/routes/attachment-routes";
import projectRoutes from "@/routes/project-routes";
import taskRoutes from "@/routes/task-routes";

const app = new OpenAPIHono<HonoEnv>();

app.doc("/openapi.json", {
  openapi: "3.1.0",
  info: {
    title: "Starter API",
    version: "1.0.0",
    description: "Project management API with tasks and file attachments",
  },
});

app.get("/docs", swaggerUI({ url: "/openapi.json" }));

const api = new OpenAPIHono<HonoEnv>();

api.route("/", projectRoutes);
api.route("/", taskRoutes);
api.route("/", attachmentRoutes);

app.route("/api/v1", api);

export default app;
