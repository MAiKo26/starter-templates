package errors

type ConflictError struct {
	AppError
}

func NewConflictError(message string) *ConflictError {
	if message == "" {
		message = "Resource conflict"
	}
	return &ConflictError{
		AppError: AppError{
			Message:      message,
			StatusCode:   409,
			IsOperational: true,
		},
	}
}
