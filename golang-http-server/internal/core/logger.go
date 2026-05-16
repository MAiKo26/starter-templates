package core

import (
	"context"
	"log/slog"
	"os"
)

var logger *slog.Logger

func InitLogger(level string, pretty bool) {
	var lvl slog.Level
	switch level {
	case "DEBUG":
		lvl = slog.LevelDebug
	case "INFO":
		lvl = slog.LevelInfo
	case "WARNING":
		lvl = slog.LevelWarn
	case "ERROR":
		lvl = slog.LevelError
	case "CRITICAL":
		lvl = slog.LevelError
	default:
		lvl = slog.LevelInfo
	}

	opts := &slog.HandlerOptions{
		Level: lvl,
	}

	var handler slog.Handler
	if pretty {
		handler = slog.NewTextHandler(os.Stdout, opts)
	} else {
		handler = slog.NewJSONHandler(os.Stdout, opts)
	}

	logger = slog.New(handler)
}

func GetLogger() *slog.Logger {
	if logger == nil {
		InitLogger("INFO", false)
	}
	return logger
}

func LoggerWithCtx(ctx context.Context) *slog.Logger {
	if logger == nil {
		InitLogger("INFO", false)
	}
	attrs := attrsFromCtx(ctx)
	args := make([]any, len(attrs))
	for i, attr := range attrs {
		args[i] = attr
	}
	return logger.With(slog.Group("request", args...))
}

func attrsFromCtx(ctx context.Context) []slog.Attr {
	var attrs []slog.Attr
	if requestID := ctx.Value("requestID"); requestID != nil {
		if id, ok := requestID.(string); ok {
			attrs = append(attrs, slog.String("request_id", id))
		}
	}
	return attrs
}
