import { randomUUID } from "node:crypto";

import { count, eq } from "drizzle-orm";

import { NotFoundError } from "@/core/errors/not-found-error";
import { resolveApiLogger } from "@/core/logger";
import { buildPaginationMeta } from "@/core/pagination";
import { getPresignedPutUrl, getPresignedUrl } from "@/core/s3-client";
import { db } from "@/db";
import { type Attachment, type NewAttachment, attachments } from "@/db/schema";
import { env } from "@/env";

interface ListParams {
  taskId: string;
  limit: number;
  offset: number;
}

interface CreateParams {
  taskId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  uploadedBy?: string;
}

export const attachmentService = {
  async list({ taskId, limit, offset }: ListParams) {
    const logger = resolveApiLogger();
    logger.debug({ taskId, limit, offset }, "Listing attachments");

    const where = eq(attachments.taskId, taskId);

    const [items, totalResult] = await Promise.all([
      db
        .select()
        .from(attachments)
        .where(where)
        .limit(limit)
        .offset(offset)
        .orderBy(attachments.createdAt),
      db.select({ count: count() }).from(attachments).where(where),
    ]);

    return {
      items,
      meta: buildPaginationMeta(totalResult[0].count, limit, offset),
    };
  },

  async findById(id: string): Promise<Attachment> {
    const logger = resolveApiLogger();
    logger.debug({ id }, "Finding attachment by ID");

    const result = await db
      .select()
      .from(attachments)
      .where(eq(attachments.id, id))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundError("Attachment");
    }

    return result[0];
  },

  async create(params: CreateParams) {
    const logger = resolveApiLogger();
    logger.info({ fileName: params.fileName }, "Creating attachment");

    const fileKey = `uploads/${randomUUID()}-${params.fileName}`;

    const newAttachment: NewAttachment = {
      taskId: params.taskId,
      fileName: params.fileName,
      fileKey,
      mimeType: params.mimeType,
      fileSize: params.fileSize,
      uploadedBy: params.uploadedBy,
    };

    const result = await db
      .insert(attachments)
      .values(newAttachment)
      .returning();
    const attachment = result[0];

    const uploadUrl = await getPresignedPutUrl(env.MINIO_BUCKET_NAME, fileKey);

    return { attachment, uploadUrl };
  },

  async getDownloadUrl(id: string, expiresInSec = 3600): Promise<string> {
    const attachment = await this.findById(id);
    return getPresignedUrl(
      env.MINIO_BUCKET_NAME,
      attachment.fileKey,
      expiresInSec,
    );
  },

  async delete(id: string): Promise<boolean> {
    const logger = resolveApiLogger();
    logger.info({ id }, "Deleting attachment");

    await this.findById(id);

    const result = await db
      .delete(attachments)
      .where(eq(attachments.id, id))
      .returning();

    return result.length > 0;
  },

  async healthCheck(): Promise<boolean> {
    try {
      await db.select({ count: count() }).from(attachments).limit(1);
      return true;
    } catch {
      return false;
    }
  },
};
