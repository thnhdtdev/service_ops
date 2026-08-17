package httpapi

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/thnhdtdev/service_ops/backend/internal/auth"
)

type fakeAuthenticator struct {
	user          auth.User
	err           error
	receivedToken string
}

func (f *fakeAuthenticator) GetUser(_ context.Context, accessToken string) (auth.User, error) {
	f.receivedToken = accessToken
	return f.user, f.err
}

func TestHealth(t *testing.T) {
	request := httptest.NewRequest(http.MethodGet, "/health", nil)
	recorder := httptest.NewRecorder()

	NewHandler(&fakeAuthenticator{}).ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, recorder.Code)
	}

	if contentType := recorder.Header().Get("Content-Type"); contentType != "application/json" {
		t.Fatalf("expected JSON content type, got %q", contentType)
	}

	if body := strings.TrimSpace(recorder.Body.String()); body != `{"status":"ok"}` {
		t.Fatalf("unexpected response body: %s", body)
	}
}

func TestUnknownRouteReturnsNotFound(t *testing.T) {
	request := httptest.NewRequest(http.MethodGet, "/unknown", nil)
	recorder := httptest.NewRecorder()

	NewHandler(&fakeAuthenticator{}).ServeHTTP(recorder, request)

	if recorder.Code != http.StatusNotFound {
		t.Fatalf("expected status %d, got %d", http.StatusNotFound, recorder.Code)
	}
}

func TestCurrentUserRequiresBearerToken(t *testing.T) {
	request := httptest.NewRequest(http.MethodGet, "/api/me", nil)
	recorder := httptest.NewRecorder()

	NewHandler(&fakeAuthenticator{}).ServeHTTP(recorder, request)

	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("expected status %d, got %d", http.StatusUnauthorized, recorder.Code)
	}
}

func TestCurrentUserReturnsAuthenticatedUser(t *testing.T) {
	authenticator := &fakeAuthenticator{
		user: auth.User{
			ID:    "user-123",
			Email: "owner@example.com",
		},
	}
	request := httptest.NewRequest(http.MethodGet, "/api/me", nil)
	request.Header.Set("Authorization", "Bearer valid-token")
	recorder := httptest.NewRecorder()

	NewHandler(authenticator).ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, recorder.Code)
	}

	if authenticator.receivedToken != "valid-token" {
		t.Fatalf("expected token %q, got %q", "valid-token", authenticator.receivedToken)
	}

	if body := strings.TrimSpace(recorder.Body.String()); body != `{"id":"user-123","email":"owner@example.com"}` {
		t.Fatalf("unexpected response body: %s", body)
	}
}

func TestCurrentUserRejectsInvalidToken(t *testing.T) {
	authenticator := &fakeAuthenticator{err: auth.ErrInvalidToken}
	request := httptest.NewRequest(http.MethodGet, "/api/me", nil)
	request.Header.Set("Authorization", "Bearer expired-token")
	recorder := httptest.NewRecorder()

	NewHandler(authenticator).ServeHTTP(recorder, request)

	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("expected status %d, got %d", http.StatusUnauthorized, recorder.Code)
	}
}

func TestCurrentUserHandlesAuthenticationServiceError(t *testing.T) {
	authenticator := &fakeAuthenticator{err: errors.New("Supabase unavailable")}
	request := httptest.NewRequest(http.MethodGet, "/api/me", nil)
	request.Header.Set("Authorization", "Bearer valid-token")
	recorder := httptest.NewRecorder()

	NewHandler(authenticator).ServeHTTP(recorder, request)

	if recorder.Code != http.StatusServiceUnavailable {
		t.Fatalf("expected status %d, got %d", http.StatusServiceUnavailable, recorder.Code)
	}
}
