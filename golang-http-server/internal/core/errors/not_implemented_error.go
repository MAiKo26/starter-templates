package errors

type NotImplementedError struct {
	AppError
}

func NewNotImplementedError(message string) *NotImplementedError {
	if message == "" {
		message = "Not implemented"
	}
	return &NotImplementedError{
		AppError: AppError{
			Message:      message,
			StatusCode:   501,
			IsOperational: true,
		},
	}
}
