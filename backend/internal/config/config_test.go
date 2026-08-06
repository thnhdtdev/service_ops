package config

import "testing"

func TestLoadUsesDefaults(t *testing.T) {
	t.Setenv("PORT", "")
	t.Setenv("APP_ENV", "")
	t.Setenv("SUPABASE_URL", "")
	t.Setenv("SUPABASE_PUBLISHABLE_KEY", "")

	cfg := Load()

	if cfg.Port != defaultPort {
		t.Fatalf("expected default port %q, got %q", defaultPort, cfg.Port)
	}

	if cfg.Environment != defaultEnvironment {
		t.Fatalf("expected default environment %q, got %q", defaultEnvironment, cfg.Environment)
	}

	if cfg.SupabaseURL != "" {
		t.Fatalf("expected empty Supabase URL, got %q", cfg.SupabaseURL)
	}

	if cfg.SupabasePublishableKey != "" {
		t.Fatalf("expected empty Supabase publishable key, got %q", cfg.SupabasePublishableKey)
	}
}

func TestLoadReadsEnvironment(t *testing.T) {
	t.Setenv("PORT", "9000")
	t.Setenv("APP_ENV", "test")
	t.Setenv("SUPABASE_URL", "https://example.supabase.co")
	t.Setenv("SUPABASE_PUBLISHABLE_KEY", "test-publishable-key")

	cfg := Load()

	if cfg.Port != "9000" {
		t.Fatalf("expected port %q, got %q", "9000", cfg.Port)
	}

	if cfg.Environment != "test" {
		t.Fatalf("expected environment %q, got %q", "test", cfg.Environment)
	}

	if cfg.SupabaseURL != "https://example.supabase.co" {
		t.Fatalf("unexpected Supabase URL: %q", cfg.SupabaseURL)
	}

	if cfg.SupabasePublishableKey != "test-publishable-key" {
		t.Fatalf("unexpected Supabase publishable key: %q", cfg.SupabasePublishableKey)
	}
}
