package model

type ShortenRequest struct {
	URL string `json:"url"`
}

type ShortenResponse struct {
	Success  bool   `json:"success"`
	ShortURL string `json:"shortURL"`
	Error    string `json:"error"`
}

type RedirectResponse struct {
	Success    bool   `json:"success"`
	OrginalURL string ` json:"originalURL"`
	Error      string `json:"error"`
}
