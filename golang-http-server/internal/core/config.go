package core

import (
	"os"
	"strconv"
	"strings"
)

type Config struct {
	Port                    int
	NodeEnv                 string
	LogLevel                string
	LogPretty               bool
	DatabaseURL             string
	PGPoolMax               int
	PGPoolMin               int
	CORSAllowedOrigins      []string
	BetterAuthSecret        string
	BetterAuthURL           string
	AuthCookieSecure        bool
	AuthCookieMaxAgeSeconds int
	MinioEndpoint           string
	MinioPort               int
	MinioAccessKey          string
	MinioSecretKey          string
	MinioBucketName         string
	MinioSecure             bool
	RedisURL                string
	RateLimitWindowMS       int
	RateLimitMaxRequests    int
}

func LoadConfig() *Config {
	cfg := &Config{
		Port:                    getEnvInt("PORT", 8000),
		NodeEnv:                 getEnvString("NODE_ENV", "development"),
		LogLevel:                getEnvString("LOG_LEVEL", "DEBUG"),
		LogPretty:               getEnvBool("LOG_PRETTY", true),
		DatabaseURL:             getEnvString("DATABASE_URL", ""),
		PGPoolMax:               getEnvInt("PG_POOL_MAX", 10),
		PGPoolMin:               getEnvInt("PG_POOL_MIN", 1),
		CORSAllowedOrigins:      getEnvStringSlice("CORS_ALLOWED_ORIGINS", []string{"http://localhost:3000"}),
		BetterAuthSecret:        getEnvString("BETTER_AUTH_SECRET", ""),
		BetterAuthURL:           getEnvString("BETTER_AUTH_URL", "http://localhost:8000"),
		AuthCookieSecure:        getEnvBool("AUTH_COOKIE_SECURE", false),
		AuthCookieMaxAgeSeconds: getEnvInt("AUTH_COOKIE_MAX_AGE_SECONDS", 604800),
		MinioEndpoint:           getEnvString("MINIO_ENDPOINT", "localhost"),
		MinioPort:               getEnvInt("MINIO_PORT", 9000),
		MinioAccessKey:          getEnvString("MINIO_ACCESS_KEY", "minioadmin"),
		MinioSecretKey:          getEnvString("MINIO_SECRET_KEY", "minioadmin"),
		MinioBucketName:         getEnvString("MINIO_BUCKET_NAME", "starter-blobs"),
		MinioSecure:             getEnvBool("MINIO_SECURE", false),
		RedisURL:                getEnvString("REDIS_URL", "redis://localhost:6379"),
		RateLimitWindowMS:       getEnvInt("RATE_LIMIT_WINDOW_MS", 60000),
		RateLimitMaxRequests:    getEnvInt("RATE_LIMIT_MAX_REQUESTS", 100),
	}

	return cfg
}

func getEnvString(key string, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}

func getEnvInt(key string, defaultVal int) int {
	if val := os.Getenv(key); val != "" {
		if parsed, err := strconv.Atoi(val); err == nil {
			return parsed
		}
	}
	return defaultVal
}

func getEnvBool(key string, defaultVal bool) bool {
	if val := os.Getenv(key); val != "" {
		if parsed, err := strconv.ParseBool(val); err == nil {
			return parsed
		}
	}
	return defaultVal
}

func getEnvStringSlice(key string, defaultVal []string) []string {
	if val := os.Getenv(key); val != "" {
		return strings.Split(val, ",")
	}
	return defaultVal
}
