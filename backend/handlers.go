package main

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"
)

type api struct {
	store *Store
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}

func (a *api) listTasks(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, a.store.List())
}

func (a *api) createTask(w http.ResponseWriter, r *http.Request) {
	var in taskInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		writeError(w, http.StatusBadRequest, "corpo da requisição inválido")
		return
	}

	in.Title = strings.TrimSpace(in.Title)
	if in.Title == "" {
		writeError(w, http.StatusUnprocessableEntity, "título é obrigatório")
		return
	}
	if in.Status == "" {
		in.Status = string(StatusTodo)
	}
	if !Status(in.Status).Valid() {
		writeError(w, http.StatusUnprocessableEntity, "status inválido")
		return
	}

	now := time.Now()
	t := Task{
		ID:          newID(),
		Title:       in.Title,
		Description: strings.TrimSpace(in.Description),
		Status:      Status(in.Status),
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	if err := a.store.Create(t); err != nil {
		writeError(w, http.StatusInternalServerError, "falha ao salvar tarefa")
		return
	}
	writeJSON(w, http.StatusCreated, t)
}

func (a *api) updateTask(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	existing, ok := a.store.Get(id)
	if !ok {
		writeError(w, http.StatusNotFound, "tarefa não encontrada")
		return
	}

	var in taskInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		writeError(w, http.StatusBadRequest, "corpo da requisição inválido")
		return
	}

	in.Title = strings.TrimSpace(in.Title)
	if in.Title == "" {
		writeError(w, http.StatusUnprocessableEntity, "título é obrigatório")
		return
	}
	if !Status(in.Status).Valid() {
		writeError(w, http.StatusUnprocessableEntity, "status inválido")
		return
	}

	existing.Title = in.Title
	existing.Description = strings.TrimSpace(in.Description)
	existing.Status = Status(in.Status)
	existing.UpdatedAt = time.Now()

	if err := a.store.Update(existing); err != nil {
		writeError(w, http.StatusInternalServerError, "falha ao salvar tarefa")
		return
	}
	writeJSON(w, http.StatusOK, existing)
}

func (a *api) deleteTask(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if _, ok := a.store.Get(id); !ok {
		writeError(w, http.StatusNotFound, "tarefa não encontrada")
		return
	}
	if err := a.store.Delete(id); err != nil {
		writeError(w, http.StatusInternalServerError, "falha ao excluir tarefa")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
