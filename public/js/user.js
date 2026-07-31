import { globalStore } from "./store.js";
import { bankApi } from "./api.js";

export class UserController {
    constructor(store, api) {
        this.store = store;
        this.api = api;
    }

    async init() {
        // Try fetching latest user data from Go backend
        const result = await this.api.fetchUser();
        if (result.success && !result.isFallback) {
            this.store.setUser({
                name: result.data.username || result.data.name,
                email: result.data.email,
                balance: result.data.balance !== undefined ? result.data.balance : this.store.getState().account.balance
            });
        }
    }
}

export const userController = new UserController(globalStore, bankApi);
