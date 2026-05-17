import { z } from "@hono/zod-openapi";

import { PaginationMetaSchema, PaginationQuerySchema } from "@/core/pagination";

export const AttachmentSchema = z.object({
  id: z.string().uuid().openapi({ description: "Attachment ID" }),
  taskId: z.string().uuid().openapi({ description: "Parent task ID" }),
  fileName: z
    .string()
    .openapi({ description: "Original file name", example: "report.pdf" }),
  fileKey: z.string().openapi({ description: "S3 object key" }),
  mimeType: z
    .string()
    .openapi({ description: "MIME type", example: "application/pdf" }),
  fileSize: z
    .number()
    .int()
    .openapi({ description: "File size in bytes", example: 1024 }),
  uploadedBy: z
    .string()
    .uuid()
    .nullable()
    .openapi({ description: "Uploader user ID" }),
  createdAt: z.string().datetime().openapi({ description: "Upload timestamp" }),
});

export const AttachmentCreateSchema = z.object({
  fileName: z.string().min(1).max(255).openapi({
    description: "Original file name",
    example: "report.pdf",
  }),
  mimeType: z.string().min(1).max(128).openapi({
    description: "MIME type",
    example: "application/pdf",
  }),
  fileSize: z.number().int().min(1).openapi({
    description: "File size in bytes",
    example: 1024,
  }),
});

export const AttachmentListQuerySchema = PaginationQuerySchema;

export const AttachmentListResponseSchema = z.object({
  data: z.array(AttachmentSchema),
  meta: PaginationMetaSchema,
});

export const AttachmentUploadResponseSchema = z.object({
  uploadUrl: z.string().url().openapi({
    description: "Presigned URL for uploading the file",
  }),
  attachment: AttachmentSchema,
});
