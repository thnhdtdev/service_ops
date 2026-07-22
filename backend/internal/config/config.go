package config

import "os"

const (
	defaultPort        = "8080"
	defaultEnvironment = "development"
)

// Config contains the runtime configuration for the API.
type Config struct {
	Port        string
	Environment string
}

// Load reads configuration from environment variables and applies safe defaults.
func Load() Config {
	return Config{
		Port:        valueOrDefault("PORT", defaultPort),
		Environment: valueOrDefault("APP_ENV", defaultEnvironment),
	}
}

func valueOrDefault(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}

	return fallback
}
