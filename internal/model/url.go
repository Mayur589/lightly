package model

type ShortenRequest struct {
	URL string `json:"url"`
}

type ShortenResponse struct {
	Success  bool   `json:"success"`
	ShortURL string `json:"shortURL"`
	Error    string `json:"error"`
}
