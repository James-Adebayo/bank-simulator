package repository

// import "encoding/json"

type UserRepository struct{
	// db here
}

type User struct {
	Username string `json:"username"`
	Email string	`json:"email"`
	Balance float64	`json:"balance"`
}

func MakeUserRepository() *UserRepository{
	return &UserRepository{}
}

func (r *UserRepository) GetUser(id int) (*User, error){
	return &User{
		Username: "virgo",
		Email: "virgo@gmail.com",
		Balance: 20000.74,
	}, nil
}