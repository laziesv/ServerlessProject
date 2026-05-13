package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"sync/atomic"
	"time"
)

type priority string

const (
	priorityLow    priority = "low"
	priorityMedium priority = "medium"
	priorityHigh   priority = "high"
)

type task struct {
	ID        int64    `json:"id"`
	Title     string   `json:"title"`
	Note      string   `json:"note"`
	Priority  priority `json:"priority"`
	Completed bool     `json:"completed"`
	CreatedAt string   `json:"createdAt"`
	UpdatedAt string   `json:"updatedAt"`
}

type taskInput struct {
	Title     string   `json:"title"`
	Note      string   `json:"note"`
	Priority  priority `json:"priority"`
	Completed bool     `json:"completed"`
}

type store struct {
	mu     sync.RWMutex
	nextID int64
	tasks  map[int64]task
}

var (
	appStart      = time.Now()
	requestsTotal atomic.Uint64
)

func main() {
	taskStore := newStore()
	mux := http.NewServeMux()

	mux.HandleFunc("/api/health", healthHandler)
	mux.HandleFunc("/metrics", metricsHandler)
	mux.HandleFunc("/api/tasks", taskStore.tasksHandler)
	mux.HandleFunc("/api/tasks/", taskStore.taskByIDHandler)

	port := getEnv("PORT", "8080")
	log.Printf("todo backend listening on :%s", port)
	if err := http.ListenAndServe(":"+port, withMiddleware(mux)); err != nil {
		log.Fatal(err)
	}
}

func newStore() *store {
	s := &store{
		nextID: 4,
		tasks:  map[int64]task{},
	}

	now := time.Now().Format(time.RFC3339)
	s.tasks[1] = task{ID: 1, Title: "เตรียม Jenkins pipeline", Note: "ตรวจ stage build, test, docker push และ deploy", Priority: priorityHigh, Completed: false, CreatedAt: now, UpdatedAt: now}
	s.tasks[2] = task{ID: 2, Title: "ตรวจ Kubernetes manifests", Note: "deployment.yaml ต้องใช้ image และ replicas ถูกต้อง", Priority: priorityMedium, Completed: true, CreatedAt: now, UpdatedAt: now}
	s.tasks[3] = task{ID: 3, Title: "สรุป dashboard monitoring", Note: "Prometheus scrape /metrics และ Grafana มีอย่างน้อย 3 panels", Priority: priorityLow, Completed: false, CreatedAt: now, UpdatedAt: now}

	return s
}

func (s *store) tasksHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		s.listTasks(w)
	case http.MethodPost:
		s.createTask(w, r)
	default:
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
	}
}

func (s *store) taskByIDHandler(w http.ResponseWriter, r *http.Request) {
	id, ok := parseID(r.URL.Path)
	if !ok {
		writeError(w, http.StatusBadRequest, "invalid task id")
		return
	}

	switch r.Method {
	case http.MethodPut:
		s.updateTask(w, r, id)
	case http.MethodDelete:
		s.deleteTask(w, id)
	default:
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
	}
}

func (s *store) listTasks(w http.ResponseWriter) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	tasks := make([]task, 0, len(s.tasks))
	for _, item := range s.tasks {
		tasks = append(tasks, item)
	}

	writeJSON(w, http.StatusOK, tasks)
}

func (s *store) createTask(w http.ResponseWriter, r *http.Request) {
	input, ok := decodeTaskInput(w, r)
	if !ok {
		return
	}

	now := time.Now().Format(time.RFC3339)
	newTask := task{
		ID:        s.nextTaskID(),
		Title:     strings.TrimSpace(input.Title),
		Note:      normalizeNote(input.Note),
		Priority:  normalizePriority(input.Priority),
		Completed: input.Completed,
		CreatedAt: now,
		UpdatedAt: now,
	}

	s.mu.Lock()
	s.tasks[newTask.ID] = newTask
	s.mu.Unlock()

	writeJSON(w, http.StatusCreated, newTask)
}

func (s *store) updateTask(w http.ResponseWriter, r *http.Request, id int64) {
	input, ok := decodeTaskInput(w, r)
	if !ok {
		return
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	existing, found := s.tasks[id]
	if !found {
		writeError(w, http.StatusNotFound, "task not found")
		return
	}

	existing.Title = strings.TrimSpace(input.Title)
	existing.Note = normalizeNote(input.Note)
	existing.Priority = normalizePriority(input.Priority)
	existing.Completed = input.Completed
	existing.UpdatedAt = time.Now().Format(time.RFC3339)
	s.tasks[id] = existing

	writeJSON(w, http.StatusOK, existing)
}

func (s *store) deleteTask(w http.ResponseWriter, id int64) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, found := s.tasks[id]; !found {
		writeError(w, http.StatusNotFound, "task not found")
		return
	}

	delete(s.tasks, id)
	w.WriteHeader(http.StatusNoContent)
}

func (s *store) nextTaskID() int64 {
	s.mu.Lock()
	defer s.mu.Unlock()

	id := s.nextID
	s.nextID++
	return id
}

func decodeTaskInput(w http.ResponseWriter, r *http.Request) (taskInput, bool) {
	var input taskInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json body")
		return input, false
	}

	input.Title = strings.TrimSpace(input.Title)
	if input.Title == "" {
		writeError(w, http.StatusBadRequest, "title is required")
		return input, false
	}

	return input, true
}

func parseID(path string) (int64, bool) {
	rawID := strings.TrimPrefix(path, "/api/tasks/")
	id, err := strconv.ParseInt(rawID, 10, 64)
	return id, err == nil && id > 0
}

func normalizeNote(value string) string {
	value = strings.TrimSpace(value)
	if value == "" {
		return "ไม่มีรายละเอียดเพิ่มเติม"
	}
	return value
}

func normalizePriority(value priority) priority {
	switch value {
	case priorityLow, priorityMedium, priorityHigh:
		return value
	default:
		return priorityMedium
	}
}

func healthHandler(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{
		"status":    "ok",
		"service":   "todo-backend",
		"timestamp": time.Now().Format(time.RFC3339),
	})
}

func metricsHandler(w http.ResponseWriter, _ *http.Request) {
	uptime := int64(time.Since(appStart).Seconds())
	total := requestsTotal.Load()

	w.Header().Set("Content-Type", "text/plain; version=0.0.4; charset=utf-8")
	fmt.Fprintf(w, "# HELP todo_backend_info Static backend information.\n")
	fmt.Fprintf(w, "# TYPE todo_backend_info gauge\n")
	fmt.Fprintf(w, "todo_backend_info{service=\"todo-backend\",language=\"go\"} 1\n")
	fmt.Fprintf(w, "# HELP http_requests_total Total HTTP requests handled by the backend.\n")
	fmt.Fprintf(w, "# TYPE http_requests_total counter\n")
	fmt.Fprintf(w, "http_requests_total{service=\"todo-backend\"} %d\n", total)
	fmt.Fprintf(w, "# HELP todo_backend_uptime_seconds Backend uptime in seconds.\n")
	fmt.Fprintf(w, "# TYPE todo_backend_uptime_seconds gauge\n")
	fmt.Fprintf(w, "todo_backend_uptime_seconds %d\n", uptime)
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(payload); err != nil {
		log.Printf("write json response: %v", err)
	}
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}

func withMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requestsTotal.Add(1)
		w.Header().Set("Access-Control-Allow-Origin", getEnv("CORS_ORIGIN", "*"))
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func getEnv(key, fallback string) string {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	return value
}
