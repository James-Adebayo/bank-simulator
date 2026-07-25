from service.investmentService import InvestmentService;

class InvestmentController: 
    def investmentcalculation(amount: int, rate: float):
        result = InvestmentService.investmentcalculation(amount, rate)
        if (result['error']):
            return {"error" : result['error']}
        return {"message" : result['message']}