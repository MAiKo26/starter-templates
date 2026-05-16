package middleware

import (
	"encoding/json"
	"net/http"

	"golang-http-server/internal/core/errors"
	"golang-http-server/internal/dto"
)

func ErrorHandler(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(dto.ErrorResponse{
					Error: "internal server error",
				})
			}
		}()

		next.ServeHTTP(w, r)
	})
}

func WriteError(w http.ResponseWriter, err error) {
	w.Header().Set("Content-Type", "application/json")

	var appErr *errors.AppError
	if e, ok := err.(*errors.AppError); ok {
		appErr = e
	} else {
		appErr = &errors.AppError{
			Message:      "internal server error",
			StatusCode:   500,
			IsOperational: false,
		}
	}

	w.WriteHeader(appErr.StatusCode)
	json.NewEncoder(w).Encode(dto.ErrorResponse{
		Error: appErr.Message,
	})
}

func WriteJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}
