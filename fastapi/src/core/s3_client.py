from datetime import timedelta

from minio import Minio

from src.core.config import Settings


class S3Client:
    def __init__(self, settings: Settings) -> None:
        self._client = Minio(
            f"{settings.minio_endpoint}:{settings.minio_port}",
            access_key=settings.minio_access_key,
            secret_key=settings.minio_secret_key,
            secure=settings.minio_secure,
        )
        self._bucket_name = settings.minio_bucket_name

    def bucket_exists(self, bucket_name: str | None = None) -> bool:
        return self._client.bucket_exists(bucket_name or self._bucket_name)

    def ensure_bucket_exists(self, bucket_name: str | None = None) -> None:
        name = bucket_name or self._bucket_name
        if not self._client.bucket_exists(name):
            self._client.make_bucket(name)

    def get_presigned_url(self, object_name: str, expires_seconds: int = 3600) -> str:
        return self._client.presigned_get_object(
            self._bucket_name, object_name, expires=timedelta(seconds=expires_seconds)
        )

    def get_presigned_put_url(self, object_name: str, expires_seconds: int = 3600) -> str:
        return self._client.presigned_put_object(
            self._bucket_name, object_name, expires=timedelta(seconds=expires_seconds)
        )


_s3_client: S3Client | None = None


def get_s3_client(settings: Settings) -> S3Client:
    global _s3_client
    if _s3_client is None:
        _s3_client = S3Client(settings)
    return _s3_client
