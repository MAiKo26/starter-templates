package routes

import (
	"net/http"

	"golang-http-server/internal/core"
	"golang-http-server/internal/db"
	"golang-http-server/internal/repository"
	"golang-http-server/internal/service"
)

type App struct {
	ProjectService    *service.ProjectService
	TaskService       *service.TaskService
	AttachmentService *service.AttachmentService
	Registry          *Registry
}

func NewApp(s3Client *core.S3Client, reg *Registry) *App {
	sqlDB := db.GetDB()

	projectRepo := repository.NewProjectRepository(sqlDB)
	taskRepo := repository.NewTaskRepository(sqlDB)
	attachmentRepo := repository.NewAttachmentRepository(sqlDB)

	return &App{
		ProjectService:    service.NewProjectService(projectRepo),
		TaskService:       service.NewTaskService(taskRepo),
		AttachmentService: service.NewAttachmentService(attachmentRepo, s3Client),
		Registry:          reg,
	}
}

func (app *App) Handler() http.Handler {
	mux := http.NewServeMux()

	app.registerProjectRoutes(mux)
	app.registerTaskRoutes(mux)
	app.registerAttachmentRoutes(mux)

	return mux
}
