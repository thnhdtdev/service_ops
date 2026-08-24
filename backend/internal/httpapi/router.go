// Package httpapi contains the HTTP transport for the ServiceOps API.
package httpapi

import (
	"encoding/json"
	"log"
	"net/http"
)

type errorResponse struct {
	Error string `json:"error"`
}

// NewHandler builds the API routes.
func NewHandler(authenticator Authenticator) http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /health", health)
	// /api/me là route mẫu được bảo vệ để kiểm tra toàn bộ luồng authentication.
	mux.Handle(
		"GET /api/me",
		requireAuthentication(authenticator, http.HandlerFunc(currentUser)),
	)

	return mux
}

func health(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{
		"status": "ok",
	})
}

func currentUser(w http.ResponseWriter, r *http.Request) {
	user, ok := userFromContext(r.Context())
	if !ok {
		// Trường hợp này chỉ xảy ra nếu handler bị gọi mà không đi qua middleware.
		writeJSON(w, http.StatusInternalServerError, errorResponse{
			Error: "Không thể đọc thông tin người dùng.",
		})
		return
	}

	writeJSON(w, http.StatusOK, user)
}

// writeJSON thống nhất cách các handler trả JSON và xử lý lỗi encode.
func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	if err := json.NewEncoder(w).Encode(value); err != nil {
		log.Printf("encode JSON response: %v", err)
	}
}
