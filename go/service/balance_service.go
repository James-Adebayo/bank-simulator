package service

import "bank-simulator/repository"
type BalanceService struct{
	repo *repository.BalanceRepository
}

func MakeBalanceService(r *repository.BalanceRepository) *BalanceService{
	return &BalanceService{
		repo: r,
	}
}

func (b *BalanceService) Deposit(amount float64) (float64, error){
	return b.repo.Deposit(amount);
}