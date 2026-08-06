package auth

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestNewClientRejectsMissingConfiguration(t *testing.T) {
	tests := []struct {
		name           string
		supabaseURL    string
		publishableKey string
	}{
		{name: "missing URL", publishableKey: "test-key"},
		{name: "missing publishable key", supabaseURL: "https://example.supabase.co"},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			_, err := NewClient(test.supabaseURL, test.publishableKey)
			if err == nil {
				t.Fatal("expected configuration error, got nil")
			}
		})
	}
}

func TestGetUserReturnsAuthenticatedUser(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/auth/v1/user" {
			t.Errorf("expected path %q, got %q", "/auth/v1/user", r.URL.Path)
		}

		if r.Header.Get("apikey") != "test-key" {
			t.Errorf("unexpected apikey header: %q", r.Header.Get("apikey"))
		}

		if r.Header.Get("Authorization") != "Bearer valid-token" {
			t.Errorf("unexpected Authorization header: %q", r.Header.Get("Authorization"))
		}

		w.Header().Set("Content-Type", "application/json")
		if _, err := w.Write([]byte(`{"id":"user-123","email":"owner@example.com"}`)); err != nil {
			t.Errorf("write response: %v", err)
		}
	}))
	t.Cleanup(server.Close)

	client, err := NewClient(server.URL, "test-key")
	if err != nil {
		t.Fatalf("create client: %v", err)
	}

	user, err := client.GetUser(context.Background(), "valid-token")
	if err != nil {
		t.Fatalf("get user: %v", err)
	}

	if user.ID != "user-123" || user.Email != "owner@example.com" {
		t.Fatalf("unexpected user: %+v", user)
	}
}

func TestGetUserMapsUnauthorizedResponseToInvalidToken(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusUnauthorized)
	}))
	t.Cleanup(server.Close)

	client, err := NewClient(server.URL, "test-key")
	if err != nil {
		t.Fatalf("create client: %v", err)
	}

	_, err = client.GetUser(context.Background(), "expired-token")
	if !errors.Is(err, ErrInvalidToken) {
		t.Fatalf("expected ErrInvalidToken, got %v", err)
	}
}

func TestGetUserRejectsEmptyToken(t *testing.T) {
	client, err := NewClient("https://example.supabase.co", "test-key")
	if err != nil {
		t.Fatalf("create client: %v", err)
	}

	_, err = client.GetUser(context.Background(), "  ")
	if !errors.Is(err, ErrInvalidToken) {
		t.Fatalf("expected ErrInvalidToken, got %v", err)
	}
}
