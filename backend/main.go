package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	ginprometheus "github.com/zsais/go-gin-prometheus"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Todo struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Title     string    `json:"title"`
	Done      bool      `json:"done"`
	CreatedAt time.Time `json:"created_at"`
}

var db *gorm.DB

func main() {
	_ = godotenv.Load()

	connectDB()

	r := gin.Default()

	// CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders: []string{"Content-Type"},
		MaxAge:       12 * time.Hour,
	}))

	// Prometheus Metrics
	p := ginprometheus.NewPrometheus("gin")
	p.Use(r)

	// Health Check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
		})
	})

	// Routes
	api := r.Group("/api")

	api.GET("/todos", getTodos)
	api.POST("/todos", createTodo)
	api.PUT("/todos/:id", toggleTodo)
	api.DELETE("/todos/:id", deleteTodo)

	// Port
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 Server started on :%s", port)

	r.Run(":" + port)
}

func connectDB() {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_SSLMODE"),
	)

	var err error

	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("❌ DB connect failed:", err)
	}

	// Auto Migrate
	err = db.AutoMigrate(&Todo{})
	if err != nil {
		log.Fatal("❌ AutoMigrate failed:", err)
	}

	log.Println("✅ DB connected + AutoMigrated")
}

func getTodos(c *gin.Context) {
	var todos []Todo

	db.Order("id desc").Find(&todos)

	c.JSON(http.StatusOK, todos)
}

func createTodo(c *gin.Context) {
	var todo Todo

	if err := c.ShouldBindJSON(&todo); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	todo.Done = false

	db.Create(&todo)

	c.JSON(http.StatusOK, todo)
}

func toggleTodo(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var todo Todo

	if err := db.First(&todo, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "not found",
		})
		return
	}

	todo.Done = !todo.Done

	db.Save(&todo)

	c.JSON(http.StatusOK, todo)
}

func deleteTodo(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	db.Delete(&Todo{}, id)

	c.JSON(http.StatusOK, gin.H{
		"message": "deleted",
	})
}
