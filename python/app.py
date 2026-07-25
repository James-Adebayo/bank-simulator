from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from controller.investmentController import router as investment_router

app = FastAPI(title="Bank Simulator - Financial Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(investment_router)

@app.get("/")
def home():
    return {"message": "Bank Simulator Financial Engine running"}