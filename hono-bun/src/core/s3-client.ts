import * as Minio from "minio";

import { logger } from "@/core/logger";
import { env } from "@/env";

export const s3Client = new Minio.Client({
  endPoint: env.MINIO_ENDPOINT,
  port: env.MINIO_PORT,
  useSSL: env.MINIO_SECURE,
  accessKey: env.MINIO_ACCESS_KEY,
  secretKey: env.MINIO_SECRET_KEY,
});

export async function ensureBucketExists(bucketName: string): Promise<void> {
  const exists = await s3Client.bucketExists(bucketName);
  if (!exists) {
    await s3Client.makeBucket(bucketName, "us-east-1");
    logger.info({ bucket: bucketName }, "Created MinIO bucket");
  }
}

export async function initializeBuckets(): Promise<void> {
  await ensureBucketExists(env.MINIO_BUCKET_NAME);
}

export async function getPresignedUrl(
  bucketName: string,
  objectName: string,
  expirySeconds = 3600,
): Promise<string> {
  return s3Client.presignedGetObject(bucketName, objectName, expirySeconds);
}

export async function getPresignedPutUrl(
  bucketName: string,
  objectName: string,
  expirySeconds = 3600,
): Promise<string> {
  return s3Client.presignedPutObject(bucketName, objectName, expirySeconds);
}
