const username = document.getElementById('username');
const email = document.getElementById('email');
export const balance = document.getElementById('balance');

class UserApi{
    async fetchUser(){
        const response = await fetch("http://localhost:8080/user");
        const data = await response.json()
        return data
    }
}

class UserStore{
    constructor(){
        this.user = null;
    }
    async storeUser(user){
        this.user = user;
        this.update();
    }
    update(){
        username.textContent = this.user.data.username;
        email.textContent = this.user.data.email;
        balance.textContent = this.user.data.balance;
    }
}

class UserController
{
    constructor(api, store){
        this.api = api;
        this.store = store;
    }

    async user(){
        const user = await this.api.fetchUser();
        this.store.storeUser(user);
    }
}

const api = new UserApi();
const store = new UserStore();
export const controller = new UserController(api, store);

controller.user()
