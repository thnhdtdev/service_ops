package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

//Tạo một struct HealthResponse để định nghĩa cấu trúc dữ liệu trả về cho endpoint /health
type HealthResponse struct {
	Status string `json:"status"`
	Service string `json:"service"`
}

type LaudryService struct {
	ID int `json:"id"`
	Name string `json:"name"`
	Price int `json:"price"`
}

var services = []LaudryService{
	{ID: 1, Name: "Giặt ủi", Price: 10000},
	{ID: 2, Name: "Giặt khô", Price: 15000},
	{ID: 3, Name: "Ủi quần áo", Price: 5000},
}


func main() {
	//Khi người dùng truy cập thì vào func homeHandler
	http.HandleFunc("/", homeHandler)
	http.HandleFunc("/health", healthHandler)
	http.HandleFunc("/services", serviceHandler)

	fmt.Println("Starting server on :8080")

	err := http.ListenAndServe(":8080", nil)

	//Nếu biến err đang chứa lỗi thì in ra lỗi đó
	if err != nil {
		fmt.Println("Error starting server:", err)
	}
}

func homeHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "ServiceOps Backend đang hoạt động")
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	response := HealthResponse{
		Status:  "ok",
		Service: "ServiceName",
	}

	//Kiểu dữ liệu trả về là JSON
	w.Header().Set("Content-Type", "application/json")
	err := json.NewEncoder(w).Encode(response)
	if err != nil {
		fmt.Println("Error encoding JSON response:", err)
	}
}

func serviceHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method == http.MethodGet {
		err := json.NewEncoder(w).Encode(services)
		if err != nil {
			fmt.Println("Không thể trả về JSON:", err)
		}
		return
	}

	if r.Method == http.MethodPost {
		var newService LaudryService

		err := json.NewDecoder(r.Body).Decode(&newService)
		if err != nil {
			http.Error(
				w,
				"Dữ liệu gửi lên không hợp lệ",
				http.StatusBadRequest,
			)
			return
		}

		//Tạo id tự động
		newService.ID = len(services) + 1

		//Thêm Phần tử mới vào danh sách
		services = append(services, newService)

		w.WriteHeader(http.StatusCreated)

		err = json.NewEncoder(w).Encode(newService)
		if err != nil {
			fmt.Println("Không thể trả về JSON:", err)
		}

		return
	}

	http.Error(
		w,
		"Phương thức không được hỗ trợ",
		http.StatusMethodNotAllowed,
	)
}