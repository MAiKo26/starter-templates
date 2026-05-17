import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";

import type { HonoEnv } from "@/core/hono-env";
import {
  AttachmentCreateSchema,
  AttachmentListQuerySchema,
  AttachmentListResponseSchema,
  AttachmentUploadResponseSchema,
} from "@/schemas/attachment-schemas";
import { ErrorSchema } from "@/schemas/common-schemas";
import { attachmentService } from "@/services/attachment-service";

const attachmentRoutes = new OpenAPIHono<HonoEnv>();

const listAttachments = createRoute({
  method: "get",
  path: "/tasks/{taskId}/attachments",
  tags: ["Attachments"],
  summary: "List attachments for a task",
  request: {
    params: z.object({ taskId: z.string().uuid() }),
    query: AttachmentListQuerySchema,
  },
  responses: {
    200: {
      description: "List of attachments",
      content: {
        "application/json": { schema: AttachmentListResponseSchema },
      },
    },
  },
});

attachmentRoutes.openapi(listAttachments, async (c) => {
  const { taskId } = c.req.valid("param");
  const query = c.req.valid("query");
  const { items, meta } = await attachmentService.list({
    taskId,
    limit: query.limit,
    offset: query.offset,
  });
  return c.json(
    {
      data: items.map((a) => ({
        id: a.id,
        taskId: a.taskId,
        fileName: a.fileName,
        fileKey: a.fileKey,
        mimeType: a.mimeType,
        fileSize: a.fileSize,
        uploadedBy: a.uploadedBy,
        createdAt: a.createdAt.toISOString(),
      })),
      meta,
    },
    200,
  );
});

const createAttachment = createRoute({
  method: "post",
  path: "/tasks/{taskId}/attachments",
  tags: ["Attachments"],
  summary: "Create attachment (returns presigned upload URL)",
  request: {
    params: z.object({ taskId: z.string().uuid() }),
    body: {
      content: { "application/json": { schema: AttachmentCreateSchema } },
    },
  },
  responses: {
    201: {
      description: "Created with presigned URL",
      content: {
        "application/json": { schema: AttachmentUploadResponseSchema },
      },
    },
  },
});

attachmentRoutes.openapi(createAttachment, async (c) => {
  const { taskId } = c.req.valid("param");
  const body = c.req.valid("json");
  const { attachment, uploadUrl } = await attachmentService.create({
    taskId,
    fileName: body.fileName,
    mimeType: body.mimeType,
    fileSize: body.fileSize,
    uploadedBy: c.get("user")?.id,
  });
  return c.json(
    {
      uploadUrl,
      attachment: {
        id: attachment.id,
        taskId: attachment.taskId,
        fileName: attachment.fileName,
        fileKey: attachment.fileKey,
        mimeType: attachment.mimeType,
        fileSize: attachment.fileSize,
        uploadedBy: attachment.uploadedBy,
        createdAt: attachment.createdAt.toISOString(),
      },
    },
    201,
  );
});

const getDownloadUrl = createRoute({
  method: "get",
  path: "/attachments/{id}/download",
  tags: ["Attachments"],
  summary: "Get presigned download URL",
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: {
    200: {
      description: "Download URL",
      content: {
        "application/json": {
          schema: z.object({ downloadUrl: z.string().url() }),
        },
      },
    },
    404: {
      description: "Not found",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

attachmentRoutes.openapi(getDownloadUrl, async (c) => {
  const { id } = c.req.valid("param");
  const downloadUrl = await attachmentService.getDownloadUrl(id);
  return c.json({ downloadUrl }, 200);
});

export default attachmentRoutes;
