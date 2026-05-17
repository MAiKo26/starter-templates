package routes

import (
	"encoding/json"
	"net/http"
	"reflect"
	"strconv"

	"golang-http-server/internal/core/errors"
	"golang-http-server/internal/dto"
	"golang-http-server/internal/middleware"
)

func (app *App) registerProjectRoutes(mux *http.ServeMux) {
	app.Registry.Add("GET", "/api/v1/projects", nil, reflect.TypeOf(dto.ProjectListResponse{}), reflect.TypeOf(dto.ProjectListQuery{}))
	app.Registry.Add("GET", "/api/v1/projects/{id}", nil, reflect.TypeOf(dto.ProjectResponse{}), nil)
	app.Registry.Add("POST", "/api/v1/projects", reflect.TypeOf(dto.ProjectCreate{}), reflect.TypeOf(dto.ProjectResponse{}), nil)
	app.Registry.Add("PATCH", "/api/v1/projects/{id}", reflect.TypeOf(dto.ProjectUpdate{}), reflect.TypeOf(dto.ProjectResponse{}), nil)
	app.Registry.Add("DELETE", "/api/v1/projects/{id}", nil, nil, nil)

	mux.HandleFunc("GET /api/v1/projects", app.listProjects)
	mux.HandleFunc("GET /api/v1/projects/{id}", app.getProject)
	mux.HandleFunc("POST /api/v1/projects", app.createProject)
	mux.HandleFunc("PATCH /api/v1/projects/{id}", app.updateProject)
	mux.HandleFunc("DELETE /api/v1/projects/{id}", app.deleteProject)
}

func (app *App) listProjects(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	query := r.URL.Query()
	limit, _ := strconv.Atoi(query.Get("limit"))
	if limit <= 0 {
		limit = 20
	}
	offset, _ := strconv.Atoi(query.Get("offset"))
	if offset < 0 {
		offset = 0
	}

	var search *string
	if s := query.Get("search"); s != "" {
		search = &s
	}
	var status *string
	if s := query.Get("status"); s != "" {
		status = &s
	}

	projects, meta, err := app.ProjectService.List(ctx, search, status, limit, offset)
	if err != nil {
		middleware.WriteError(w, err)
		return
	}

	middleware.WriteJSON(w, http.StatusOK, dto.ProjectListResponse{
		Data: projects,
		Meta: meta,
	})
}

func (app *App) getProject(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id := r.PathValue("id")

	project, err := app.ProjectService.FindByID(ctx, id)
	if err != nil {
		middleware.WriteError(w, err)
		return
	}

	middleware.WriteJSON(w, http.StatusOK, project)
}

func (app *App) createProject(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var params dto.ProjectCreate
	if err := json.NewDecoder(r.Body).Decode(&params); err != nil {
		middleware.WriteError(w, errors.NewAppError("invalid request body", 400))
		return
	}

	project, err := app.ProjectService.Create(ctx, params, nil)
	if err != nil {
		if ve, ok := err.(*dto.ValidationError); ok {
			middleware.WriteError(w, errors.NewAppError(ve.Error(), 400))
			return
		}
		middleware.WriteError(w, err)
		return
	}

	middleware.WriteJSON(w, http.StatusCreated, project)
}

func (app *App) updateProject(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id := r.PathValue("id")

	var params dto.ProjectUpdate
	if err := json.NewDecoder(r.Body).Decode(&params); err != nil {
		middleware.WriteError(w, errors.NewAppError("invalid request body", 400))
		return
	}

	project, err := app.ProjectService.Update(ctx, id, params)
	if err != nil {
		if ve, ok := err.(*dto.ValidationError); ok {
			middleware.WriteError(w, errors.NewAppError(ve.Error(), 400))
			return
		}
		middleware.WriteError(w, err)
		return
	}

	middleware.WriteJSON(w, http.StatusOK, project)
}

func (app *App) deleteProject(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id := r.PathValue("id")

	if err := app.ProjectService.Delete(ctx, id); err != nil {
		middleware.WriteError(w, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
