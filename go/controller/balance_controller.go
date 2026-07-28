package controller

import (
	"fmt"
	"net/http"
	"bank-simulator/service"
	"encoding/json"
)

type BalanceController struct {
	service *service.BalanceService
}

type Deposite struct {
	Amount 	float64 `json"amount"`
}
func MakeBalanceController(s *service.BalanceService) *BalanceController{
	return &BalanceController{
		service: s,
	}
}

func (bc *BalanceController) Deposit(w http.ResponseWriter, r *http.Request){
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type")
	w.Header().Set("Content-Type", "application/json")
	if r.Method == http.MethodOptions{
		w.WriteHeader(http.StatusNoContent)
		return
	}

	var deposit Deposite
	err := json.NewDecoder(r.Body).Decode(&deposit)
	if err != nil {
		fmt.Println(err)
		return
	}

	amount, errors := bc.service.Deposit(deposit.Amount)
	if errors != nil {
		fmt.Println(errors)
		return
	}

	fmt.Println(amount)
	response := Response{Success: true, Message: "Action accepted", Data: amount}
	json.NewEncoder(w).Encode(response)
}