package httpapi

import (
	"context"
	"errors"
	"log"
	"net/http"
	"strings"

	"github.com/thnhdtdev/service_ops/backend/internal/auth"
)

// Authenticator mô tả đúng khả năng middleware cần từ Supabase Auth client.
// Interface nhỏ này cũng giúp kiểm thử middleware mà không gọi mạng thật.
type Authenticator interface {
	GetUser(ctx context.Context, accessToken string) (auth.User, error)
}

// authenticatedUserContextKey là key riêng dùng để lưu user trong context.
// Dùng một kiểu riêng giúp tránh trùng key với package khác.
type authenticatedUserContextKey struct{}

// requireAuthentication bảo vệ handler phía sau bằng Supabase access token.
func requireAuthentication(authenticator Authenticator, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		accessToken, ok := parseBearerToken(r.Header.Get("Authorization"))
		if !ok {
			writeJSON(w, http.StatusUnauthorized, errorResponse{
				Error: "Bạn cần đăng nhập để tiếp tục.",
			})
			return
		}

		user, err := authenticator.GetUser(r.Context(), accessToken)
		if err != nil {
			if errors.Is(err, auth.ErrInvalidToken) {
				writeJSON(w, http.StatusUnauthorized, errorResponse{
					Error: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.",
				})
				return
			}

			// Chỉ log lỗi kỹ thuật ở backend, không trả chi tiết này cho người dùng.
			log.Printf("authenticate request: %v", err)
			writeJSON(w, http.StatusServiceUnavailable, errorResponse{
				Error: "Không thể xác thực lúc này. Vui lòng thử lại sau.",
			})
			return
		}

		// Gắn user đã xác thực vào request để handler phía sau có thể sử dụng.
		ctx := context.WithValue(r.Context(), authenticatedUserContextKey{}, user)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// parseBearerToken đọc header theo định dạng: Authorization: Bearer <token>.
func parseBearerToken(authorizationHeader string) (string, bool) {
	parts := strings.Fields(authorizationHeader)
	if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
		return "", false
	}

	return parts[1], true
}

func userFromContext(ctx context.Context) (auth.User, bool) {
	user, ok := ctx.Value(authenticatedUserContextKey{}).(auth.User)
	return user, ok
}
