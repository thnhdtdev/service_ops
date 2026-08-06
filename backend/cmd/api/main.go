package main

import (
	"errors"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"

	"github.com/thnhdtdev/service_ops/backend/internal/auth"
	"github.com/thnhdtdev/service_ops/backend/internal/config"
	"github.com/thnhdtdev/service_ops/backend/internal/httpapi"
)

func main() {
	// Nạp backend/.env khi chạy local. Các biến môi trường đã tồn tại
	// (ví dụ trên production) được giữ nguyên và có độ ưu tiên cao hơn.
	if err := godotenv.Load(); err != nil && !errors.Is(err, os.ErrNotExist) {
		log.Fatalf("load .env file: %v", err)
	}

	// Đọc port và cấu hình Supabase từ biến môi trường.
	cfg := config.Load()
	address := ":" + cfg.Port

	// Tạo một Auth client duy nhất và tái sử dụng cho tất cả request.
	authClient, err := auth.NewClient(
		cfg.SupabaseURL,
		cfg.SupabasePublishableKey,
	)
	if err != nil {
		log.Fatalf("invalid authentication configuration: %v", err)
	}

	// Router nhận Auth client để bảo vệ các endpoint cần đăng nhập.
	handler := httpapi.NewHandler(authClient)

	log.Printf("ServiceOps API is running on %s", address)

	// ListenAndServe chặn tại đây và phục vụ request cho đến khi có lỗi.
	if err := http.ListenAndServe(address, handler); err != nil {
		log.Fatalf("start HTTP server: %v", err)
	}
}
