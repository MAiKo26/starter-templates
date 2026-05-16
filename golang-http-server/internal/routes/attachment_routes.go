package routes

import (
	"encoding/json"
	"net/http"
	"strconv"

	"golang-http-server/internal/core/errors"
	"golang-http-server/internal/dto"
	"golang-http-server/internal/middleware"
)

func (app *App) registerAttachmentRoutes(mux *http.ServeMux) {
	mux.HandleFunc("GET /api/v1/tasks/{taskId}/attachments", app.listAttachments)
	mux.HandleFunc("POST /api/v1/tasks/{taskId}/attachments", app.createAttachment)
	mux.HandleFunc("GET /api/v1/attachments/{id}/download", app.getAttachmentDownload)
	mux.HandleFunc("DELETE /api/v1/attachments/{id}", app.deleteAttachment)
}

func (app *App) listAttachments(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	taskID := r.PathValue("taskId")

	query := r.URL.Query()
	limit, _ := strconv.Atoi(query.Get("limit"))
	if limit <= 0 {
		limit = 20
	}
	offset, _ := strconv.Atoi(query.Get("offset"))
	if offset < 0 {
		offset = 0
	}

	attachments, meta, err := app.AttachmentService.List(ctx, taskID, limit, offset)
	if err != nil {
		middleware.WriteError(w, err)
		return
	}

	middleware.WriteJSON(w, http.StatusOK, dto.AttachmentListResponse{
		Data: attachments,
		Meta: meta,
	})
}

func (app *App) createAttachment(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	taskID := r.PathValue("taskId")

	var params dto.AttachmentCreate
	if err := json.NewDecoder(r.Body).Decode(&params); err != nil {
		middleware.WriteError(w, errors.NewAppError("invalid request body", 400))
		return
	}

	result, err := app.AttachmentService.Create(ctx, taskID, params)
	if err != nil {
		if ve, ok := err.(*dto.ValidationError); ok {
			middleware.WriteError(w, errors.NewAppError(ve.Error(), 400))
			return
		}
		middleware.WriteError(w, err)
		return
	}

	middleware.WriteJSON(w, http.StatusCreated, result)
}

func (app *App) getAttachmentDownload(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id := r.PathValue("id")

	downloadURL, err := app.AttachmentService.GetDownloadURL(ctx, id)
	if err != nil {
		middleware.WriteError(w, err)
		return
	}

	middleware.WriteJSON(w, http.StatusOK, map[string]string{
		"download_url": downloadURL,
	})
}

func (app *App) deleteAttachment(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id := r.PathValue("id")

	if err := app.AttachmentService.Delete(ctx, id); err != nil {
		middleware.WriteError(w, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
