from fastapi import APIRouter
from pydantic import BaseModel
from service.investmentService import InvestmentService

router = APIRouter(prefix="/api/investment", tags=["Investment"])

class InvestmentRequest(BaseModel):
    amount: float
    rate: float
    years: int = 1

@router.post("/calculate")
def investment_calculate(body: InvestmentRequest):
    result = InvestmentService.investmentcalculation(body.amount, body.rate, body.years)
    if result.get("error"):
        return {"error": result["error"]}
    return result