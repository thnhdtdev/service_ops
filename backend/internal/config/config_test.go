package config

import "testing"

func TestLoadUsesDefaults(t *testing.T) {
	t.Setenv("PORT", "")
	t.Setenv("APP_ENV", "")

	cfg := Load()

	if cfg.Port != defaultPort {
		t.Fatalf("expected default port %q, got %q", defaultPort, cfg.Port)
	}

	if cfg.Environment != defaultEnvironment {
		t.Fatalf("expected default environment %q, got %q", defaultEnvironment, cfg.Environment)
	}
}

func TestLoadReadsEnvironment(t *testing.T) {
	t.Setenv("PORT", "9000")
	t.Setenv("APP_ENV", "test")

	cfg := Load()

	if cfg.Port != "9000" {
		t.Fatalf("expected port %q, got %q", "9000", cfg.Port)
	}

	if cfg.Environment != "test" {
		t.Fatalf("expected environment %q, got %q", "test", cfg.Environment)
	}
}
