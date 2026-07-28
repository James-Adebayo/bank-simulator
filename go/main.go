package main

import (
	"net/http"
	"fmt"
	"bank-simulator/controller"
	"bank-simulator/service"
	"bank-simulator/repository"
)


func main(){
	userRepo := repository.MakeUserRepository()

	userService := service.MakeUserService(userRepo)

	userController :=  controller.MakeUserController(userService)

	balanceRepo := repository.MakeBalanceRepository()

	balanceService := service.MakeBalanceService(balanceRepo)

	balanceController := controller.MakeBalanceController(balanceService)

	fmt.Println("Server starts at http://localhost:8080/")
	
	http.HandleFunc("/user", userController.GetUser)
	http.HandleFunc("/deposit", balanceController.Deposit)

	http.ListenAndServe(":8080", nil)
}