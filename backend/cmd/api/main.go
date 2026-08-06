package main

import (
	"fmt"
	"net/http"

	"github.com/thnhdtdev/service_ops/backend/internal/config"
	"github.com/thnhdtdev/service_ops/backend/internal/httpapi"
)

func main() {
	cfg:= config.Load()
	address := ":" + cfg.Port
	handler := httpapi.NewHandler()	
	
	http.ListenAndServe(address, handler)
	

	// http.HandleFunc("/",homeHandler)
	// http.HandleFunc("/health",healthHandler)
	// http.HandleFunc("/services",servicesHandler)

	fmt.Printf("Starting server on %s", address)

	err:=http.ListenAndServe(address,nil)
	if err != nil{
		fmt.Println("Error starting server", err)
	}
}