package main

import (
	"log"
	"net/http"
	"os"
)

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func main() {
	port := getenv("PORT", "8080")
	dataFile := getenv("DATA_FILE", "tasks.json")
	origin := getenv("ALLOWED_ORIGIN", "http://localhost:5173")

	a := &api{store: NewStore(dataFile)}

	log.Printf("kanban api ouvindo em :%s (dados em %s)", port, dataFile)
	if err := http.ListenAndServe(":"+port, withCORS(origin, newRouter(a))); err != nil {
		log.Fatal(err)
	}
}
