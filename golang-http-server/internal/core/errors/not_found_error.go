package errors

import "fmt"

type NotFoundError struct {
	AppError
}

func NewNotFoundError(resource string) *NotFoundError {
	return &NotFoundError{
		AppError: AppError{
			Message:      fmt.Sprintf("%s not found", resource),
			StatusCode:   404,
			IsOperational: true,
		},
	}
}
