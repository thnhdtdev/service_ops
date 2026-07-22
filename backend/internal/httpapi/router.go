// Package httpapi contains the HTTP transport for the ServiceOps API.
package httpapi

import (
	"encoding/json"
	"net/http"
)

// NewHandler builds the API routes.
func NewHandler() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /health", health)

	return mux
}

func health(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	_ = json.NewEncoder(w).Encode(map[string]string{
		"status": "ok",
	})
}
