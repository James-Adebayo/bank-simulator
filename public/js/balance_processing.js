const depositBtn = document.getElementById('deposit');
const withdrawBtn = document.getElementById('withdraw');
const transferBtn = document.getElementById('transfer');
import { balance } from "./user.js";
depositBtn.addEventListener("click", () => {
    balance_controller.deposit(2000);
});
// withdrawBtn.addEventListener("click", () => {
//     balance_controller.withdraw(2000);
//     alert("Transaction processing");
// });
// transferBtn.addEventListener("click", () => {
//     balance_controller.transfer(2000);
//     alert("Transaction processing");
// });

class BalanceApi{
    async deposit(amount){
        const response = await fetch("http://localhost:8080/deposit", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({amount: amount})
        });

        return await response.json();
    }
}

class BalanceController{
    constructor(api){
        this.api = api;
    }
    async deposit(amount){
        const data = await this.api.deposit(amount);
        balance.textContent = data.data
    }
}

const balance_api = new BalanceApi();

const balance_controller = new BalanceController(balance_api);
