package errors

type AppError struct {
	Message      string
	StatusCode   int
	IsOperational bool
}

func (e *AppError) Error() string {
	return e.Message
}

func NewAppError(message string, statusCode int) *AppError {
	return &AppError{
		Message:      message,
		StatusCode:   statusCode,
		IsOperational: true,
	}
}
