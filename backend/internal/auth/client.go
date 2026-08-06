package auth

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"
)

// ErrInvalidToken cho biết access token bị thiếu, hết hạn hoặc không hợp lệ.
var ErrInvalidToken = errors.New("access token is invalid")

// User chứa thông tin người dùng tối thiểu mà backend cần sau khi xác thực.
type User struct {
	ID    string `json:"id"`
	Email string `json:"email"`
}

// Client gọi Supabase Auth để kiểm tra access token.
type Client struct {
	supabaseURL    string
	publishableKey string
	httpClient     *http.Client
}

// NewClient kiểm tra cấu hình và tạo Auth client có thể tái sử dụng.
func NewClient(supabaseURL, publishableKey string) (*Client, error) {
	// Chuẩn hóa cấu hình để không tạo URL có hai dấu gạch chéo liên tiếp.
	supabaseURL = strings.TrimRight(strings.TrimSpace(supabaseURL), "/")
	publishableKey = strings.TrimSpace(publishableKey)

	if supabaseURL == "" {
		return nil, errors.New("supabase URL cannot be empty")
	}

	if publishableKey == "" {
		return nil, errors.New("Supabase publishable key cannot be empty")
	}

	return &Client{
		supabaseURL:    supabaseURL,
		publishableKey: publishableKey,
		httpClient: &http.Client{
			// Timeout ngăn API chờ Supabase vô thời hạn khi có sự cố mạng.
			Timeout: 10 * time.Second,
		},
	}, nil
}

// GetUser gửi access token tới Supabase và trả về người dùng đã xác thực.
func (c *Client) GetUser(ctx context.Context, accessToken string) (User, error) {
	accessToken = strings.TrimSpace(accessToken)
	if accessToken == "" {
		return User{}, ErrInvalidToken
	}

	endpoint := c.supabaseURL + "/auth/v1/user"

	// Gắn context để request này bị hủy cùng request gốc của người dùng.
	request, err := http.NewRequestWithContext(
		ctx,
		http.MethodGet,
		endpoint,
		nil,
	)
	if err != nil {
		return User{}, fmt.Errorf("create Supabase Auth request: %w", err)
	}

	// Supabase yêu cầu cả publishable key và access token trong header.
	request.Header.Set("apikey", c.publishableKey)
	request.Header.Set("Authorization", "Bearer "+accessToken)

	response, err := c.httpClient.Do(request)
	if err != nil {
		return User{}, fmt.Errorf("call Supabase Auth: %w", err)
	}

	// Chỉ status 200 biểu thị token hợp lệ. Không đọc hoặc trả message kỹ thuật
	// từ Supabase cho người dùng để tránh làm lộ thông tin không cần thiết.
	if response.StatusCode != http.StatusOK {
		closeErr := response.Body.Close()
		if closeErr != nil {
			return User{}, fmt.Errorf("close Supabase Auth response: %w", closeErr)
		}

		if response.StatusCode == http.StatusUnauthorized ||
			response.StatusCode == http.StatusForbidden {
			return User{}, ErrInvalidToken
		}

		return User{}, fmt.Errorf(
			"Supabase Auth returned status %d",
			response.StatusCode,
		)
	}

	var user User

	decodeErr := json.NewDecoder(response.Body).Decode(&user)
	closeErr := response.Body.Close()

	if decodeErr != nil {
		return User{}, fmt.Errorf("decode Supabase user: %w", decodeErr)
	}

	if closeErr != nil {
		return User{}, fmt.Errorf("close Supabase Auth response: %w", closeErr)
	}

	if user.ID == "" {
		return User{}, errors.New("Supabase user response is missing id")
	}

	return user, nil
}
