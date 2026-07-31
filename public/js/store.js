/**
 * NexBank Reactive Store — Centralized Application State Manager
 */

export class Store {
    constructor() {
        this.state = {
            user: {
                name: "James Adebayo",
                email: "james.adebayo@nexbank.com",
                accountNo: "3084920194",
                tier: "Verified Platinum",
                currencySymbol: "₦",
                isBalanceVisible: true
            },
            account: {
                balance: 5240000.00,
                savings: 1850000.00,
                monthlyInflow: 1250000.00,
                monthlyOutflow: 380000.00,
                netWorth: 7090000.00
            },
            card: {
                number: "4532 •••• •••• 8819",
                holder: "JAMES ADEBAYO",
                expiry: "08/29",
                cvv: "492",
                theme: "black"
            },
            transactions: [
                { id: "TX-9021", type: "credit", category: "Salary", title: "Monthly Tech Salary", counterparty: "Apex Systems Inc", amount: 850000.00, date: "2026-07-28", status: "completed" },
                { id: "TX-9020", type: "debit", category: "Shopping", title: "Apple Store Purchase", counterparty: "Apple Store Victoria Island", amount: 145000.00, date: "2026-07-26", status: "completed" },
                { id: "TX-9019", type: "credit", category: "Investment", title: "Dividend Yield Payout", counterparty: "NexBank Mutual Funds", amount: 64200.00, date: "2026-07-24", status: "completed" },
                { id: "TX-9018", type: "debit", category: "Utilities", title: "Electricity & Fiber Internet", counterparty: "IKEDC & FibreOne", amount: 35000.00, date: "2026-07-22", status: "completed" },
                { id: "TX-9017", type: "credit", category: "Transfer", title: "Freelance Design Retainer", counterparty: "Sarah Jenkins", amount: 200000.00, date: "2026-07-20", status: "completed" }
            ],
            investment: {
                amount: 500000,
                rate: 14,
                years: 3,
                result: null
            },
            listeners: []
        };
    }

    getState() {
        return this.state;
    }

    subscribe(listener) {
        this.state.listeners.push(listener);
        return () => {
            this.state.listeners = this.state.listeners.filter(l => l !== listener);
        };
    }

    notify() {
        this.state.listeners.forEach(listener => listener(this.state));
    }

    setUser(userData) {
        this.state.user = { ...this.state.user, ...userData };
        this.notify();
    }

    toggleBalanceVisibility() {
        this.state.user.isBalanceVisible = !this.state.user.isBalanceVisible;
        this.notify();
    }

    setCardTheme(themeName) {
        this.state.card.theme = themeName;
        this.notify();
    }

    deposit(amount) {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) return { success: false, error: "Please enter a valid amount" };

        this.state.account.balance += numAmount;
        this.state.account.netWorth += numAmount;

        const newTx = {
            id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
            type: "credit",
            category: "Deposit",
            title: "Account Direct Deposit",
            counterparty: "Self / Cash Deposit",
            amount: numAmount,
            date: new Date().toISOString().split("T")[0],
            status: "completed"
        };

        this.state.transactions.unshift(newTx);
        this.notify();
        return { success: true, balance: this.state.account.balance, transaction: newTx };
    }

    withdraw(amount) {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) return { success: false, error: "Please enter a valid withdrawal amount" };
        if (numAmount > this.state.account.balance) return { success: false, error: "Insufficient account balance" };

        this.state.account.balance -= numAmount;
        this.state.account.netWorth -= numAmount;

        const newTx = {
            id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
            type: "debit",
            category: "Withdrawal",
            title: "ATM Cash Withdrawal",
            counterparty: "NexBank ATM Terminal",
            amount: numAmount,
            date: new Date().toISOString().split("T")[0],
            status: "completed"
        };

        this.state.transactions.unshift(newTx);
        this.notify();
        return { success: true, balance: this.state.account.balance, transaction: newTx };
    }

    transfer(recipientName, recipientAcc, bankName, amount, note) {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) return { success: false, error: "Invalid transfer amount" };
        if (numAmount > this.state.account.balance) return { success: false, error: "Insufficient balance for transfer" };

        this.state.account.balance -= numAmount;
        this.state.account.netWorth -= numAmount;

        const newTx = {
            id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
            type: "debit",
            category: "Transfer",
            title: `Transfer to ${recipientName}`,
            counterparty: `${recipientName} (${bankName} - ${recipientAcc})`,
            amount: numAmount,
            date: new Date().toISOString().split("T")[0],
            status: "completed",
            note: note || "Bank Transfer"
        };

        this.state.transactions.unshift(newTx);
        this.notify();
        return { success: true, balance: this.state.account.balance, transaction: newTx };
    }

    setInvestmentResult(result) {
        this.state.investment.result = result;
        this.notify();
    }
}

export const globalStore = new Store();
