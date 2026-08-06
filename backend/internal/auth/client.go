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

var ErrInvalidToken = errors.New("access token is invalid")

type User struct {
	ID    string `json:"id"`
	Email string `json:"email"`
}

type Client struct {
	supabaseURL     string
	publishableKey  string
	httpClient      *http.Client
}

func NewClient(supabaseURL, publishableKey string) (*Client, error) {
	supabaseURL = strings.TrimRight(strings.TrimSpace(supabaseURL), "/")
	publishableKey = strings.TrimSpace(publishableKey)
	
	if supabaseURL == "" {
		return nil, errors.New("supabaseURL cannot be empty")
	}
	if publishableKey == "" {
		return nil, errors.New("publishableKey cannot be empty")
	}
	
	return &Client{
		supabaseURL: supabaseURL,
		publishableKey: publishableKey,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}, nil
}

func (c *Client) GetUser(ctx context.Context, accessToken string) (User, error) {
	accessToken = strings.TrimSpace(accessToken)
	if accessToken == "" {
		return User{}, ErrInvalidToken
	}

	endpoint := c.supabaseURL + "/auth/v1/user"

	request, err := http.NewRequestWithContext(
		ctx,
		http.MethodGet,
		endpoint,
		nil,
	)
	if err != nil {
		return User{}, fmt.Errorf("create Supabase Auth request: %w", err)
	}

	request.Header.Set("apikey", c.publishableKey)
	request.Header.Set("Authorization", "Bearer "+accessToken)

	response, err := c.httpClient.Do(request)
	if err != nil {
		return User{}, fmt.Errorf("call Supabase Auth: %w", err)
	}

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


