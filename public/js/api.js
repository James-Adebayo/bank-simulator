/**
 * NexBank API Service — Handles HTTP communication with Go, Node.js, and Python microservices
 * includes graceful fallbacks if local servers are offline.
 */

export class BankApiService {
    constructor() {
        this.goApiUrl = "http://localhost:8080";
        this.nodeApiUrl = "http://localhost:3000";
        this.pythonApiUrl = "http://localhost:8000";
    }

    /**
     * Fetch user profile from Go backend or return fallback
     */
    async fetchUser() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            
            const response = await fetch(`${this.goApiUrl}/user`, { signal: controller.signal });
            clearTimeout(timeoutId);
            
            if (!response.ok) throw new Error("Server returned non-200 status");
            const data = await response.json();
            return { success: true, data: data.data || data };
        } catch (err) {
            console.warn("Go Backend (/user) unreachable, using dynamic local store profile.", err.message);
            return {
                success: false,
                isFallback: true,
                data: {
                    username: "James Adebayo",
                    email: "james.adebayo@nexbank.com",
                    balance: 5240000.00
                }
            };
        }
    }

    /**
     * Execute Deposit via Go/Node API or return fallback calculation
     */
    async deposit(amount) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2500);

            const response = await fetch(`${this.goApiUrl}/deposit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: parseFloat(amount) }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) throw new Error("Deposit API request failed");
            const data = await response.json();
            return { success: true, data: data.data };
        } catch (err) {
            console.warn("Backend deposit endpoint unreachable, relying on client store fallback.");
            return { success: false, isFallback: true };
        }
    }

    /**
     * Call Python Financial Engine to calculate investment compound growth
     */
    async calculateInvestment(amount, rate, years) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);

            const response = await fetch(`${this.pythonApiUrl}/api/investment/calculate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    rate: parseFloat(rate),
                    years: parseInt(years, 10)
                }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) throw new Error("Python investment service error");
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            return { success: true, data };
        } catch (err) {
            console.warn("Python Investment Service unreachable. Generating client-side financial calculation.", err.message);
            
            // Client-side financial engine formula matching Python logic exactly
            const amt = parseFloat(amount) || 0;
            const r = parseFloat(rate) || 0;
            const y = parseInt(years, 10) || 1;

            if (amt <= 0 || r <= 0 || r >= 100 || y <= 0) {
                return { success: false, error: "Invalid investment parameters" };
            }

            const rateDecimal = r / 100;
            const finalAmount = amt * Math.pow(1 + rateDecimal, y);
            const totalGain = finalAmount - amt;

            const monthlyProjection = [];
            const totalMonths = y * 12;
            for (let m = 1; m <= totalMonths; m++) {
                const monthlyVal = amt * Math.pow(1 + rateDecimal / 12, m);
                monthlyProjection.push(Math.round(monthlyVal * 100) / 100);
            }

            return {
                success: true,
                isFallback: true,
                data: {
                    error: null,
                    message: "Client financial engine calculation completed",
                    initial_amount: Math.round(amt * 100) / 100,
                    final_amount: Math.round(finalAmount * 100) / 100,
                    total_gain: Math.round(totalGain * 100) / 100,
                    rate: r,
                    years: y,
                    monthly_projection: monthlyProjection
                }
            };
        }
    }
}

export const bankApi = new BankApiService();
