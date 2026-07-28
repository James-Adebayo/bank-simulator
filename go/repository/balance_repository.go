package repository

type BalanceRepository struct {
	//
}

func MakeBalanceRepository() *BalanceRepository{
	return &BalanceRepository{}
}

func (r *BalanceRepository) Deposit(amount float64) (float64, error){
	return amount + 4000, nil
}