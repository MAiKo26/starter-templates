package routes

import (
	"encoding/json"
	"net/http"
	"strconv"

	"golang-http-server/internal/core/errors"
	"golang-http-server/internal/dto"
	"golang-http-server/internal/middleware"
)

func (app *App) registerTaskRoutes(mux *http.ServeMux) {
	mux.HandleFunc("GET /api/v1/projects/{projectId}/tasks", app.listTasks)
	mux.HandleFunc("GET /api/v1/projects/{projectId}/tasks/{id}", app.getTask)
	mux.HandleFunc("POST /api/v1/projects/{projectId}/tasks", app.createTask)
	mux.HandleFunc("PATCH /api/v1/projects/{projectId}/tasks/{id}", app.updateTask)
	mux.HandleFunc("DELETE /api/v1/projects/{projectId}/tasks/{id}", app.deleteTask)
}

func (app *App) listTasks(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	projectID := r.PathValue("projectId")

	query := r.URL.Query()
	limit, _ := strconv.Atoi(query.Get("limit"))
	if limit <= 0 {
		limit = 20
	}
	offset, _ := strconv.Atoi(query.Get("offset"))
	if offset < 0 {
		offset = 0
	}

	var status *string
	if s := query.Get("status"); s != "" {
		status = &s
	}
	var priority *string
	if s := query.Get("priority"); s != "" {
		priority = &s
	}
	var assigneeID *string
	if s := query.Get("assignee_id"); s != "" {
		assigneeID = &s
	}

	tasks, meta, err := app.TaskService.List(ctx, projectID, status, priority, assigneeID, limit, offset)
	if err != nil {
		middleware.WriteError(w, err)
		return
	}

	middleware.WriteJSON(w, http.StatusOK, dto.TaskListResponse{
		Data: tasks,
		Meta: meta,
	})
}

func (app *App) getTask(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id := r.PathValue("id")

	task, err := app.TaskService.FindByID(ctx, id)
	if err != nil {
		middleware.WriteError(w, err)
		return
	}

	middleware.WriteJSON(w, http.StatusOK, task)
}

func (app *App) createTask(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	projectID := r.PathValue("projectId")

	var params dto.TaskCreate
	if err := json.NewDecoder(r.Body).Decode(&params); err != nil {
		middleware.WriteError(w, errors.NewAppError("invalid request body", 400))
		return
	}

	task, err := app.TaskService.Create(ctx, projectID, params)
	if err != nil {
		if ve, ok := err.(*dto.ValidationError); ok {
			middleware.WriteError(w, errors.NewAppError(ve.Error(), 400))
			return
		}
		middleware.WriteError(w, err)
		return
	}

	middleware.WriteJSON(w, http.StatusCreated, task)
}

func (app *App) updateTask(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id := r.PathValue("id")

	var params dto.TaskUpdate
	if err := json.NewDecoder(r.Body).Decode(&params); err != nil {
		middleware.WriteError(w, errors.NewAppError("invalid request body", 400))
		return
	}

	task, err := app.TaskService.Update(ctx, id, params)
	if err != nil {
		if ve, ok := err.(*dto.ValidationError); ok {
			middleware.WriteError(w, errors.NewAppError(ve.Error(), 400))
			return
		}
		middleware.WriteError(w, err)
		return
	}

	middleware.WriteJSON(w, http.StatusOK, task)
}

func (app *App) deleteTask(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id := r.PathValue("id")

	if err := app.TaskService.Delete(ctx, id); err != nil {
		middleware.WriteError(w, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
