const balanceServices = require("../service/balanceService");
const balanceService = new balanceServices();

class BalanceController{
    constructor(public balanceService){
        this.balanceService = balanceService;
    }

    async getBalance(){
        const result = await balanceService.getBalance();
        if (result.error) return console.log(result.error);
        return result.message;
    }
}

module.exports = BalanceController;