package dto

import "golang-http-server/internal/core"

type ErrorResponse struct {
	Error string `json:"error"`
}

type HealthResponse struct {
	Status    string            `json:"status"`
	Timestamp string            `json:"timestamp"`
	Services  map[string]string `json:"services"`
}

type ListResponse[T any] struct {
	Data []T                `json:"data"`
	Meta core.PaginationMeta `json:"meta"`
}
