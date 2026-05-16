package core

import (
	"context"
	"fmt"
	"net/url"
	"time"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

type S3Client struct {
	client     *minio.Client
	bucketName string
}

func NewS3Client(endpoint string, port int, accessKey, secretKey, bucketName string, secure bool) (*S3Client, error) {
	addr := fmt.Sprintf("%s:%d", endpoint, port)

	client, err := minio.New(addr, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKey, secretKey, ""),
		Secure: secure,
	})
	if err != nil {
		return nil, fmt.Errorf("create minio client: %w", err)
	}

	return &S3Client{
		client:     client,
		bucketName: bucketName,
	}, nil
}

func (s *S3Client) BucketExists() bool {
	ctx := context.Background()
	exists, err := s.client.BucketExists(ctx, s.bucketName)
	return err == nil && exists
}

func (s *S3Client) EnsureBucketExists() error {
	ctx := context.Background()
	exists, err := s.client.BucketExists(ctx, s.bucketName)
	if err != nil {
		return fmt.Errorf("check bucket exists: %w", err)
	}
	if !exists {
		err = s.client.MakeBucket(ctx, s.bucketName, minio.MakeBucketOptions{})
		if err != nil {
			return fmt.Errorf("make bucket: %w", err)
		}
	}
	return nil
}

func (s *S3Client) GetPresignedURL(objectName string, expiresSeconds int) (string, error) {
	ctx := context.Background()
	reqParams := make(url.Values)
	url, err := s.client.PresignedGetObject(ctx, s.bucketName, objectName, time.Duration(expiresSeconds)*time.Second, reqParams)
	if err != nil {
		return "", fmt.Errorf("presigned get object: %w", err)
	}
	return url.String(), nil
}

func (s *S3Client) GetPresignedPutURL(objectName string, expiresSeconds int) (string, error) {
	ctx := context.Background()
	url, err := s.client.PresignedPutObject(ctx, s.bucketName, objectName, time.Duration(expiresSeconds)*time.Second)
	if err != nil {
		return "", fmt.Errorf("presigned put object: %w", err)
	}
	return url.String(), nil
}
