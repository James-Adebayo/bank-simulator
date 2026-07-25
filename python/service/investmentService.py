
class InvestmentService:
    @staticmethod
    def investmentcalculation(amount: float, rate: float, years: int = 1):
        try:
            if amount <= 0:
                return {"error": "Amount must be greater than zero"}
            if rate <= 0 or rate >= 100:
                return {"error": "Rate must be between 0 and 100"}
            if years <= 0:
                return {"error": "Years must be greater than zero"}

            rate_decimal = rate / 100
            final_amount = amount * ((1 + rate_decimal) ** years)
            total_gain = final_amount - amount

            monthly_projection = []
            for month in range(1, (years * 12) + 1):
                monthly_value = amount * ((1 + rate_decimal / 12) ** month)
                monthly_projection.append(round(monthly_value, 2))

            return {
                "error": None,
                "message": "Calculation successful",
                "initial_amount": round(amount, 2),
                "final_amount": round(final_amount, 2),
                "total_gain": round(total_gain, 2),
                "rate": rate,
                "years": years,
                "monthly_projection": monthly_projection
            }
        except Exception as e:
            return {"error": str(e)}