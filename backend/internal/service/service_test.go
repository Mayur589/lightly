package service

import (
	"testing"
)

func TestGenerateShortCode(t *testing.T) {
	code, err := GenerateShortCode()
	if err != nil {
		t.Fatalf("GenerateShortCode returned error: %v", err)
	}
	if len(code) != 6 {
		t.Errorf("Expected short code length 6, got %d (code: %s)", len(code), code)
	}
}

func TestIsValidURL(t *testing.T) {
	tests := []struct {
		name        string
		input       string
		wantErr     bool
		expectedURL string
	}{
		{
			name:        "Valid HTTPS URL",
			input:       "https://google.com/search?q=golang",
			wantErr:     false,
			expectedURL: "https://google.com/search?q=golang",
		},
		{
			name:        "Valid URL without scheme (auto prepend https)",
			input:       "github.com/mayur",
			wantErr:     false,
			expectedURL: "https://github.com/mayur",
		},
		{
			name:        "Empty string",
			input:       "",
			wantErr:     true,
			expectedURL: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			parsed, err := IsValidURL(tt.input)
			if (err != nil) != tt.wantErr {
				t.Fatalf("IsValidURL(%q) error = %v, wantErr %v", tt.input, err, tt.wantErr)
			}
			if !tt.wantErr && parsed.String() != tt.expectedURL {
				t.Errorf("IsValidURL(%q) = %q, want %q", tt.input, parsed.String(), tt.expectedURL)
			}
		})
	}
}
