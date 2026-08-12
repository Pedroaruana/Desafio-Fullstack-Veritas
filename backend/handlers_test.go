package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"testing"
)

func newTestRouter(t *testing.T) http.Handler {
	t.Helper()
	store := NewStore(filepath.Join(t.TempDir(), "tasks.json"))
	return newRouter(&api{store: store})
}

func doRequest(t *testing.T, h http.Handler, method, path string, body any) *httptest.ResponseRecorder {
	t.Helper()
	var reader *bytes.Reader
	if body != nil {
		b, err := json.Marshal(body)
		if err != nil {
			t.Fatalf("marshal body: %v", err)
		}
		reader = bytes.NewReader(b)
	} else {
		reader = bytes.NewReader(nil)
	}
	req := httptest.NewRequest(method, path, reader)
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	return rec
}

func TestCreateTask_MissingTitle(t *testing.T) {
	h := newTestRouter(t)
	rec := doRequest(t, h, http.MethodPost, "/tasks", taskInput{Description: "sem título"})

	if rec.Code != http.StatusUnprocessableEntity {
		t.Fatalf("esperava 422, veio %d: %s", rec.Code, rec.Body.String())
	}
}

func TestCreateTask_DefaultStatus(t *testing.T) {
	h := newTestRouter(t)
	rec := doRequest(t, h, http.MethodPost, "/tasks", taskInput{Title: "escrever readme"})

	if rec.Code != http.StatusCreated {
		t.Fatalf("esperava 201, veio %d: %s", rec.Code, rec.Body.String())
	}
	var created Task
	if err := json.Unmarshal(rec.Body.Bytes(), &created); err != nil {
		t.Fatalf("resposta inválida: %v", err)
	}
	if created.Status != StatusTodo {
		t.Fatalf("esperava status todo por padrão, veio %q", created.Status)
	}
	if created.ID == "" {
		t.Fatal("esperava um id gerado")
	}
}

func TestCreateTask_InvalidStatus(t *testing.T) {
	h := newTestRouter(t)
	rec := doRequest(t, h, http.MethodPost, "/tasks", taskInput{Title: "x", Status: "arquivada"})

	if rec.Code != http.StatusUnprocessableEntity {
		t.Fatalf("esperava 422, veio %d: %s", rec.Code, rec.Body.String())
	}
}

func TestListTasks(t *testing.T) {
	h := newTestRouter(t)
	doRequest(t, h, http.MethodPost, "/tasks", taskInput{Title: "tarefa 1"})
	doRequest(t, h, http.MethodPost, "/tasks", taskInput{Title: "tarefa 2"})

	rec := doRequest(t, h, http.MethodGet, "/tasks", nil)
	var list []Task
	if err := json.Unmarshal(rec.Body.Bytes(), &list); err != nil {
		t.Fatalf("resposta inválida: %v", err)
	}
	if len(list) != 2 {
		t.Fatalf("esperava 2 tarefas, veio %d", len(list))
	}
}

func TestUpdateTask_MoveEntreColunas(t *testing.T) {
	h := newTestRouter(t)
	createRec := doRequest(t, h, http.MethodPost, "/tasks", taskInput{Title: "mover"})
	var created Task
	json.Unmarshal(createRec.Body.Bytes(), &created)

	rec := doRequest(t, h, http.MethodPut, "/tasks/"+created.ID, taskInput{
		Title:  created.Title,
		Status: string(StatusInProgress),
	})
	if rec.Code != http.StatusOK {
		t.Fatalf("esperava 200, veio %d: %s", rec.Code, rec.Body.String())
	}
	var updated Task
	json.Unmarshal(rec.Body.Bytes(), &updated)
	if updated.Status != StatusInProgress {
		t.Fatalf("esperava status in_progress, veio %q", updated.Status)
	}
}

func TestUpdateTask_NotFound(t *testing.T) {
	h := newTestRouter(t)
	rec := doRequest(t, h, http.MethodPut, "/tasks/inexistente", taskInput{Title: "x", Status: string(StatusTodo)})

	if rec.Code != http.StatusNotFound {
		t.Fatalf("esperava 404, veio %d", rec.Code)
	}
}

func TestDeleteTask(t *testing.T) {
	h := newTestRouter(t)
	createRec := doRequest(t, h, http.MethodPost, "/tasks", taskInput{Title: "remover"})
	var created Task
	json.Unmarshal(createRec.Body.Bytes(), &created)

	rec := doRequest(t, h, http.MethodDelete, "/tasks/"+created.ID, nil)
	if rec.Code != http.StatusNoContent {
		t.Fatalf("esperava 204, veio %d", rec.Code)
	}

	listRec := doRequest(t, h, http.MethodGet, "/tasks", nil)
	var list []Task
	json.Unmarshal(listRec.Body.Bytes(), &list)
	if len(list) != 0 {
		t.Fatalf("esperava lista vazia após excluir, veio %d itens", len(list))
	}
}

func TestDeleteTask_NotFound(t *testing.T) {
	h := newTestRouter(t)
	rec := doRequest(t, h, http.MethodDelete, "/tasks/inexistente", nil)

	if rec.Code != http.StatusNotFound {
		t.Fatalf("esperava 404, veio %d", rec.Code)
	}
}

func TestCreateTask_OrderSequencial(t *testing.T) {
	h := newTestRouter(t)
	rec1 := doRequest(t, h, http.MethodPost, "/tasks", taskInput{Title: "primeira"})
	rec2 := doRequest(t, h, http.MethodPost, "/tasks", taskInput{Title: "segunda"})

	var t1, t2 Task
	json.Unmarshal(rec1.Body.Bytes(), &t1)
	json.Unmarshal(rec2.Body.Bytes(), &t2)

	if t1.Order != 0 || t2.Order != 1 {
		t.Fatalf("esperava order 0 e 1, veio %d e %d", t1.Order, t2.Order)
	}
}

func TestReorderTasks(t *testing.T) {
	h := newTestRouter(t)
	rec1 := doRequest(t, h, http.MethodPost, "/tasks", taskInput{Title: "a"})
	rec2 := doRequest(t, h, http.MethodPost, "/tasks", taskInput{Title: "b"})

	var t1, t2 Task
	json.Unmarshal(rec1.Body.Bytes(), &t1)
	json.Unmarshal(rec2.Body.Bytes(), &t2)

	rec := doRequest(t, h, http.MethodPut, "/tasks/reorder", reorderInput{IDs: []string{t2.ID, t1.ID}})
	if rec.Code != http.StatusOK {
		t.Fatalf("esperava 200, veio %d: %s", rec.Code, rec.Body.String())
	}

	var list []Task
	json.Unmarshal(rec.Body.Bytes(), &list)
	if len(list) != 2 || list[0].ID != t2.ID || list[1].ID != t1.ID {
		t.Fatalf("esperava [%s, %s] na nova ordem, veio %+v", t2.ID, t1.ID, list)
	}
}

func TestReorderTasks_ListaVazia(t *testing.T) {
	h := newTestRouter(t)
	rec := doRequest(t, h, http.MethodPut, "/tasks/reorder", reorderInput{IDs: []string{}})

	if rec.Code != http.StatusUnprocessableEntity {
		t.Fatalf("esperava 422, veio %d", rec.Code)
	}
}
