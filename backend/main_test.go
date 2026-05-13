package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestCreateTask(t *testing.T) {
	s := newStore()
	body := bytes.NewBufferString(`{"title":"เขียน backend Go","note":"ทำ CRUD API","priority":"high"}`)
	req := httptest.NewRequest(http.MethodPost, "/api/tasks", body)
	rec := httptest.NewRecorder()

	s.tasksHandler(rec, req)

	if rec.Code != http.StatusCreated {
		t.Fatalf("expected status %d, got %d", http.StatusCreated, rec.Code)
	}

	var created task
	if err := json.NewDecoder(rec.Body).Decode(&created); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if created.Title != "เขียน backend Go" {
		t.Fatalf("unexpected title: %s", created.Title)
	}
	if created.Priority != priorityHigh {
		t.Fatalf("unexpected priority: %s", created.Priority)
	}
}

func TestUpdateTask(t *testing.T) {
	s := newStore()
	body := bytes.NewBufferString(`{"title":"แก้ไขงาน","note":"อัปเดตจาก test","priority":"low","completed":true}`)
	req := httptest.NewRequest(http.MethodPut, "/api/tasks/1", body)
	rec := httptest.NewRecorder()

	s.taskByIDHandler(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, rec.Code)
	}

	var updated task
	if err := json.NewDecoder(rec.Body).Decode(&updated); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if !updated.Completed {
		t.Fatal("expected task to be completed")
	}
}

func TestDeleteTask(t *testing.T) {
	s := newStore()
	req := httptest.NewRequest(http.MethodDelete, "/api/tasks/1", nil)
	rec := httptest.NewRecorder()

	s.taskByIDHandler(rec, req)

	if rec.Code != http.StatusNoContent {
		t.Fatalf("expected status %d, got %d", http.StatusNoContent, rec.Code)
	}
	if _, found := s.tasks[1]; found {
		t.Fatal("expected task to be deleted")
	}
}
