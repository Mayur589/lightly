package service

import (
	"errors"
	"net/url"
	"strings"
)

func IsValidURL(raw_url string) (*url.URL, error) {
	length := len(raw_url)

	if length == 0 {
		return nil, errors.New("empty URL")
	}

	// is no http or https add at the start

	if !strings.HasPrefix(raw_url, "http://") && !strings.HasPrefix(raw_url, "https://") {
		raw_url = "https://" + raw_url
	}

	parsedURL, err := url.Parse(raw_url)
	if err != nil {
		return nil, err
	}

	scheme := strings.ToLower(parsedURL.Scheme)
	if scheme != "http" && scheme != "https" {
		return nil, errors.New("invalid scheme")
	}

	if parsedURL.Host == "" {
		return nil, errors.New("missing host")
	}

	return parsedURL, nil

}
