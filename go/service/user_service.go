package service
import "bank-simulator/repository"

type UserService struct {
	repo *repository.UserRepository
}

func MakeUserService(r *repository.UserRepository) *UserService{
	return &UserService{
		repo: r,
	}
}

func (s *UserService) GetUser(id int) (*repository.User, error){
	return s.repo.GetUser(id)
}