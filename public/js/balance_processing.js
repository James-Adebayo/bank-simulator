import { globalStore } from "./store.js";
import { bankApi } from "./api.js";

export class BalanceProcessor {
    constructor(store, api) {
        this.store = store;
        this.api = api;
    }

    async processDeposit(amount) {
        if (!amount || amount <= 0) {
            return { success: false, error: "Please enter a valid amount greater than 0" };
        }

        // Call backend API (if available)
        await this.api.deposit(amount);

        // Update local store
        const result = this.store.deposit(amount);
        return result;
    }

    async processWithdraw(amount) {
        if (!amount || amount <= 0) {
            return { success: false, error: "Please enter a valid withdrawal amount" };
        }

        const result = this.store.withdraw(amount);
        return result;
    }

    async processTransfer(recipientName, recipientAcc, bankName, amount, note) {
        if (!recipientName || !recipientAcc || !amount) {
            return { success: false, error: "Please fill in all recipient details and amount" };
        }

        const result = this.store.transfer(recipientName, recipientAcc, bankName, amount, note);
        return result;
    }
}

export const balanceProcessor = new BalanceProcessor(globalStore, bankApi);
