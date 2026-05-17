package main

import (
	"context"
	"encoding/json"
	"fmt"
	"golang-http-server/internal/core"
	"golang-http-server/internal/db"
	"golang-http-server/internal/dto"
	"golang-http-server/internal/middleware"
	"golang-http-server/internal/routes"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()

	cfg := core.LoadConfig()

	core.InitLogger(cfg.LogLevel, cfg.LogPretty)
	logger := core.GetLogger()

	logger.Info("starting server", "port", cfg.Port, "env", cfg.NodeEnv)

	if err := db.InitDB(cfg.DatabaseURL, cfg.PGPoolMax, cfg.PGPoolMin); err != nil {
		logger.Error("failed to initialize database", "error", err)
		os.Exit(1)
	}
	defer db.CloseDB()
	logger.Info("database connected")

	s3Client, err := core.NewS3Client(cfg.MinioEndpoint, cfg.MinioPort, cfg.MinioAccessKey, cfg.MinioSecretKey, cfg.MinioBucketName, cfg.MinioSecure)
	if err != nil {
		logger.Error("failed to create S3 client", "error", err)
		os.Exit(1)
	}

	if err := s3Client.EnsureBucketExists(); err != nil {
		logger.Error("failed to ensure bucket exists", "error", err)
		os.Exit(1)
	}
	logger.Info("storage initialized", "bucket", cfg.MinioBucketName)

	reg := routes.NewRegistry()

	app := routes.NewApp(s3Client, reg)

	mux := http.NewServeMux()

	corsHandler := middleware.CORSMiddleware(cfg.CORSAllowedOrigins)
	loggerHandler := middleware.LoggerMiddleware
	errorHandler := middleware.ErrorHandler
	rateLimiter := middleware.NewRateLimiter(
		time.Duration(cfg.RateLimitWindowMS)*time.Millisecond,
		cfg.RateLimitMaxRequests,
	)
	rateLimitHandler := middleware.RateLimitMiddleware(rateLimiter, "/health")

	handler := http.Handler(mux)
	handler = corsHandler(handler)
	handler = loggerHandler(handler)
	handler = errorHandler(handler)
	handler = rateLimitHandler(handler)

	mux.HandleFunc("GET /docs", reg.DocsHandler())

	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()

		dbOK := false
		storageOK := false

		if app.ProjectService.HealthCheck(ctx) {
			dbOK = true
		}
		if s3Client.BucketExists() {
			storageOK = true
		}

		status := "ok"
		if !dbOK || !storageOK {
			status = "degraded"
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(dto.HealthResponse{
			Status:    status,
			Timestamp: time.Now().UTC().Format(time.RFC3339),
			Services: map[string]string{
				"database": map[bool]string{true: "connected", false: "disconnected"}[dbOK],
				"storage":  map[bool]string{true: "connected", false: "disconnected"}[storageOK],
			},
		})
	})

	mux.Handle("/", app.Handler())

	addr := fmt.Sprintf(":%d", cfg.Port)
	server := &http.Server{
		Addr:    addr,
		Handler: handler,
	}

	go func() {
		logger.Info("server listening", "addr", addr)
		logger.Info("API docs: http://localhost:" + fmt.Sprintf("%d", cfg.Port) + "/docs")
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Error("server failed", "error", err)
			os.Exit(1)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Info("shutting down gracefully...")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		logger.Error("server forced to shutdown", "error", err)
	}

	logger.Info("server stopped")
}
