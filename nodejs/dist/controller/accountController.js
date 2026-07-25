"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
var express_1 = require("express");
exports.router = (0, express_1.Router)();
// In-memory account store (simple demo)
var account = {
    name: "James Adebayo",
    balance: 5000.00,
    savings: 1200.00,
    transactions: [
        { id: 1, type: "credit", description: "Salary Payment", amount: 3000, date: "2026-07-20" },
        { id: 2, type: "debit", description: "Grocery Store", amount: -120, date: "2026-07-21" },
        { id: 3, type: "credit", description: "Freelance Work", amount: 500, date: "2026-07-22" },
        { id: 4, type: "debit", description: "Utility Bill", amount: -80, date: "2026-07-23" },
    ]
};
exports.router.get("/", function (_req, res) {
    res.json({ name: account.name, balance: account.balance, savings: account.savings });
});
exports.router.get("/transactions", function (_req, res) {
    res.json(account.transactions);
});
exports.router.post("/deposit", function (req, res) {
    var amount = req.body.amount;
    if (!amount || amount <= 0)
        return res.status(400).json({ error: "Invalid amount" });
    account.balance += Number(amount);
    account.transactions.unshift({
        id: Date.now(), type: "credit", description: "Deposit",
        amount: Number(amount), date: new Date().toISOString().split("T")[0]
    });
    res.json({ message: "Deposit successful", balance: account.balance });
});
exports.router.post("/withdraw", function (req, res) {
    var amount = req.body.amount;
    if (!amount || amount <= 0)
        return res.status(400).json({ error: "Invalid amount" });
    if (amount > account.balance)
        return res.status(400).json({ error: "Insufficient funds" });
    account.balance -= Number(amount);
    account.transactions.unshift({
        id: Date.now(), type: "debit", description: "Withdrawal",
        amount: -Number(amount), date: new Date().toISOString().split("T")[0]
    });
    res.json({ message: "Withdrawal successful", balance: account.balance });
});
