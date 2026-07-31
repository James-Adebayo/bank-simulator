package main

import (
	"bank-simulator/controller"
	"bank-simulator/database"
	"bank-simulator/repository"
	"bank-simulator/service"
	"fmt"
	"net/http"
)

func main() {
	database.Connect()
	userRepo := repository.MakeUserRepository()

	userService := service.MakeUserService(userRepo)

	userController := controller.MakeUserController(userService)

	balanceRepo := repository.MakeBalanceRepository()

	balanceService := service.MakeBalanceService(balanceRepo)

	balanceController := controller.MakeBalanceController(balanceService)

	fmt.Println("Server starts at http://localhost:8080/")

	http.HandleFunc("/user", userController.GetUser)
	http.HandleFunc("/deposit", balanceController.Deposit)

	http.ListenAndServe(":8080", nil)
}
