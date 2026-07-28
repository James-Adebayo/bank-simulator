package controller

import (
	"fmt"
	"net/http"
	"encoding/json"
	"bank-simulator/service"
)

type UserController struct {
	service *service.UserService
}

type Response struct {
	Success 	bool	`json:"success"`
	Message		string	`json:"message"`
	Data		any		`json:"data,omitempty"`
}

func MakeUserController(s *service.UserService) *UserController{
	return &UserController{
		service: s,
	}
}

func (c *UserController) GetUser(w http.ResponseWriter, r *http.Request){
	user, err := c.service.GetUser(2)
	if err != nil {
		fmt.Println("Error: ", err)
		return
	}

	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type")
	w.Header().Set("Content-Type", "application/json")
	response := Response{Success: true, Message: "User Fetched successfully", Data: user}
	json.NewEncoder(w).Encode(response)
}