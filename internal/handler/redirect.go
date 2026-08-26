package handler

import (
	"fmt"
	"net/http"
)

func RedirectHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "Hello world from redirection")
}
