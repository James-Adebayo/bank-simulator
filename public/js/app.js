import { globalStore } from "./store.js";
import { userController } from "./user.js";
import { balanceProcessor } from "./balance_processing.js";
import { bankApi } from "./api.js";

// Utility Formatter
function formatCurrency(val, symbol = "₦") {
    const num = parseFloat(val) || 0;
    return `${symbol} ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

class AppUI {
    constructor() {
        this.currentTxFilter = "all";
        this.txSearchQuery = "";
        this.activeReceiptTx = null;
    }

    init() {
        // Initialize user data from backend/store
        userController.init();

        // Subscribe to state changes
        globalStore.subscribe((state) => this.render(state));

        // Bind Event Listeners
        this.bindEvents();

        // Initial Investment Calculation
        this.triggerInvestmentCalculation();

        // Initial Render
        this.render(globalStore.getState());
    }

    bindEvents() {
        // Balance Visibility Eye Toggle
        const eyeBtn = document.getElementById("toggleBalanceEye");
        if (eyeBtn) {
            eyeBtn.addEventListener("click", () => globalStore.toggleBalanceVisibility());
        }

        // Account Number Copy
        const copyAccBtn = document.getElementById("copyAccBtn");
        if (copyAccBtn) {
            copyAccBtn.addEventListener("click", () => {
                const accNo = globalStore.getState().user.accountNo;
                navigator.clipboard.writeText(accNo);
                this.showToast(`Account number ${accNo} copied to clipboard!`, "success");
            });
        }

        // Card Theme Selector Dots
        document.querySelectorAll(".theme-dot").forEach(dot => {
            dot.addEventListener("click", (e) => {
                const theme = e.target.dataset.theme;
                globalStore.setCardTheme(theme);
                this.showToast(`Card skin switched to ${theme.toUpperCase()}`, "success");
            });
        });

        // Quick Action Buttons -> Modals
        document.getElementById("btnDeposit")?.addEventListener("click", () => this.openModal("modalDeposit"));
        document.getElementById("btnWithdraw")?.addEventListener("click", () => this.openModal("modalWithdraw"));
        document.getElementById("btnTransfer")?.addEventListener("click", () => this.openModal("modalTransfer"));

        // Close Modal Buttons
        document.querySelectorAll(".close-modal-btn, .close-modal-trigger").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const modal = e.target.closest(".modal-overlay");
                if (modal) modal.classList.remove("active");
            });
        });

        // Deposit Presets
        document.querySelectorAll("#modalDeposit .preset-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                document.getElementById("depositAmountInput").value = e.target.dataset.val;
            });
        });

        // Deposit Form Submission
        document.getElementById("depositForm")?.addEventListener("submit", async (e) => {
            e.preventDefault();
            const amount = document.getElementById("depositAmountInput").value;
            const res = await balanceProcessor.processDeposit(amount);
            if (res.success) {
                this.closeModal("modalDeposit");
                document.getElementById("depositForm").reset();
                this.showToast(`Successfully deposited ${formatCurrency(amount)} into account!`, "success");
            } else {
                this.showToast(res.error, "error");
            }
        });

        // Withdraw Form Submission
        document.getElementById("withdrawForm")?.addEventListener("submit", async (e) => {
            e.preventDefault();
            const amount = document.getElementById("withdrawAmountInput").value;
            const res = await balanceProcessor.processWithdraw(amount);
            if (res.success) {
                this.closeModal("modalWithdraw");
                document.getElementById("withdrawForm").reset();
                this.showToast(`Withdrawal of ${formatCurrency(amount)} processed cleanly.`, "success");
            } else {
                this.showToast(res.error, "error");
            }
        });

        // Transfer Form Submission
        document.getElementById("transferForm")?.addEventListener("submit", async (e) => {
            e.preventDefault();
            const recipient = document.getElementById("transferRecipientInput").value;
            const acc = document.getElementById("transferAccInput").value;
            const bank = document.getElementById("transferBankSelect").value;
            const amount = document.getElementById("transferAmountInput").value;
            const note = document.getElementById("transferNoteInput").value;

            const res = await balanceProcessor.processTransfer(recipient, acc, bank, amount, note);
            if (res.success) {
                this.closeModal("modalTransfer");
                document.getElementById("transferForm").reset();
                this.showToast(`Transferred ${formatCurrency(amount)} to ${recipient} successfully!`, "success");
                
                // Show Digital Receipt Modal
                this.showReceiptModal(res.transaction);
            } else {
                this.showToast(res.error, "error");
            }
        });

        // Investment Inputs Slider & Number sync
        const invAmtSlider = document.getElementById("invAmtRange");
        const invAmtNum = document.getElementById("invAmtInput");
        const invRateSlider = document.getElementById("invRateRange");
        const invRateNum = document.getElementById("invRateInput");
        const invYearsSlider = document.getElementById("invYearsRange");
        const invYearsNum = document.getElementById("invYearsInput");

        const syncAndCalc = () => {
            this.triggerInvestmentCalculation();
        };

        if (invAmtSlider && invAmtNum) {
            invAmtSlider.addEventListener("input", (e) => { invAmtNum.value = e.target.value; syncAndCalc(); });
            invAmtNum.addEventListener("input", (e) => { invAmtSlider.value = e.target.value; syncAndCalc(); });
        }

        if (invRateSlider && invRateNum) {
            invRateSlider.addEventListener("input", (e) => { invRateNum.value = e.target.value; syncAndCalc(); });
            invRateNum.addEventListener("input", (e) => { invRateSlider.value = e.target.value; syncAndCalc(); });
        }

        if (invYearsSlider && invYearsNum) {
            invYearsSlider.addEventListener("input", (e) => { invYearsNum.value = e.target.value; syncAndCalc(); });
            invYearsNum.addEventListener("input", (e) => { invYearsSlider.value = e.target.value; syncAndCalc(); });
        }

        // Transaction Filter Pills
        document.querySelectorAll(".filter-pill").forEach(pill => {
            pill.addEventListener("click", (e) => {
                document.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("active"));
                e.target.classList.add("active");
                this.currentTxFilter = e.target.dataset.filter;
                this.renderTransactions(globalStore.getState());
            });
        });

        // Transaction Search Bar
        const txSearchInput = document.getElementById("txSearchInput");
        if (txSearchInput) {
            txSearchInput.addEventListener("input", (e) => {
                this.txSearchQuery = e.target.value.toLowerCase().trim();
                this.renderTransactions(globalStore.getState());
            });
        }
    }

    async triggerInvestmentCalculation() {
        const amt = document.getElementById("invAmtInput")?.value || 500000;
        const rate = document.getElementById("invRateInput")?.value || 14;
        const years = document.getElementById("invYearsInput")?.value || 3;

        // Update Slider Labels
        document.getElementById("invAmtBadge").textContent = formatCurrency(amt);
        document.getElementById("invRateBadge").textContent = `${rate}%`;
        document.getElementById("invYearsBadge").textContent = `${years} Year${years > 1 ? 's' : ''}`;

        const res = await bankApi.calculateInvestment(amt, rate, years);
        if (res.success && res.data) {
            globalStore.setInvestmentResult(res.data);
        }
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.add("active");
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove("active");
    }

    showReceiptModal(tx) {
        this.activeReceiptTx = tx;
        document.getElementById("receiptTxId").textContent = tx.id;
        document.getElementById("receiptDate").textContent = tx.date;
        document.getElementById("receiptAmount").textContent = formatCurrency(tx.amount);
        document.getElementById("receiptRecipient").textContent = tx.counterparty;
        document.getElementById("receiptNote").textContent = tx.note || "N/A";
        
        this.openModal("modalReceipt");
    }

    showToast(message, type = "success") {
        const container = document.getElementById("toastContainer");
        if (!container) return;

        const toast = document.createElement("div");
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                ${type === 'success' 
                    ? '<polyline points="20 6 9 17 4 12"></polyline>' 
                    : '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>'}
            </svg>
            <span>${message}</span>
        `;

        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(50px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    render(state) {
        // 1. Render User Details & Account Balance
        const isVisible = state.user.isBalanceVisible;
        const balEl = document.getElementById("balance");
        if (balEl) {
            balEl.textContent = isVisible 
                ? state.account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : "••••••••";
        }

        const usernameEl = document.getElementById("username");
        if (usernameEl) usernameEl.textContent = state.user.name;

        const userInitials = document.getElementById("userInitials");
        if (userInitials) {
            const parts = state.user.name.split(" ");
            userInitials.textContent = parts.map(p => p[0]).join("").toUpperCase();
        }

        const userEmail = document.getElementById("userEmail");
        if (userEmail) userEmail.textContent = state.user.email;

        const netWorthEl = document.getElementById("netWorthVal");
        if (netWorthEl) netWorthEl.textContent = formatCurrency(state.account.netWorth);

        const savingsEl = document.getElementById("savingsVal");
        if (savingsEl) savingsEl.textContent = formatCurrency(state.account.savings);

        const inflowEl = document.getElementById("inflowVal");
        if (inflowEl) inflowEl.textContent = formatCurrency(state.account.monthlyInflow);

        const outflowEl = document.getElementById("outflowVal");
        if (outflowEl) outflowEl.textContent = formatCurrency(state.account.monthlyOutflow);

        // 2. Render Virtual Card Widget
        const vCard = document.getElementById("virtualCard");
        if (vCard) {
            vCard.className = `virtual-card theme-${state.card.theme}`;
            document.querySelectorAll(".theme-dot").forEach(dot => {
                dot.classList.toggle("active", dot.dataset.theme === state.card.theme);
            });
        }

        // 3. Render Investment Results & SVG Chart
        if (state.investment.result) {
            const inv = state.investment.result;
            document.getElementById("resFinalAmt").textContent = formatCurrency(inv.final_amount);
            document.getElementById("resTotalGain").textContent = formatCurrency(inv.total_gain);

            this.renderInvestmentChart(inv.monthly_projection || []);
        }

        // 4. Render Transactions
        this.renderTransactions(state);
    }

    renderTransactions(state) {
        const tbody = document.getElementById("txTableBody");
        if (!tbody) return;

        let filtered = state.transactions;

        // Apply category filter
        if (this.currentTxFilter === "credits") {
            filtered = filtered.filter(t => t.type === "credit");
        } else if (this.currentTxFilter === "debits") {
            filtered = filtered.filter(t => t.type === "debit");
        }

        // Apply search query
        if (this.txSearchQuery) {
            filtered = filtered.filter(t => 
                t.title.toLowerCase().includes(this.txSearchQuery) ||
                t.counterparty.toLowerCase().includes(this.txSearchQuery) ||
                t.category.toLowerCase().includes(this.txSearchQuery)
            );
        }

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">
                        No transactions found matching criteria.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filtered.map(tx => `
            <tr>
                <td>
                    <div class="tx-type-flex">
                        <div class="tx-icon-bubble ${tx.type}">
                            ${tx.type === 'credit' ? '↓' : '↑'}
                        </div>
                        <div>
                            <div style="font-weight: 600; color: var(--text-primary);">${tx.title}</div>
                            <div style="font-size: 0.78rem; color: var(--text-muted);">${tx.counterparty}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <span style="font-size: 0.82rem; color: var(--text-secondary);">${tx.category}</span>
                </td>
                <td>
                    <span style="font-size: 0.82rem; color: var(--text-muted);">${tx.date}</span>
                </td>
                <td>
                    <span class="tx-amount ${tx.type}">
                        ${tx.type === 'credit' ? '+' : '-'}${formatCurrency(tx.amount)}
                    </span>
                </td>
                <td>
                    <span class="tx-badge completed">Completed</span>
                </td>
            </tr>
        `).join("");
    }

    renderInvestmentChart(monthlyProjection) {
        const svg = document.getElementById("investmentSvgChart");
        if (!svg || monthlyProjection.length === 0) return;

        const width = 500;
        const height = 200;
        const padding = 20;

        const minVal = Math.min(...monthlyProjection);
        const maxVal = Math.max(...monthlyProjection);

        const points = monthlyProjection.map((val, idx) => {
            const x = padding + (idx / (monthlyProjection.length - 1)) * (width - 2 * padding);
            const y = height - padding - ((val - minVal) / (maxVal - minVal || 1)) * (height - 2 * padding);
            return { x, y, val };
        });

        const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(" ");
        const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`;

        svg.innerHTML = `
            <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#00F2FE" stop-opacity="0.35"/>
                    <stop offset="100%" stop-color="#00F2FE" stop-opacity="0.0"/>
                </linearGradient>
            </defs>

            <!-- Horizontal Gridlines -->
            <line x1="${padding}" y1="${padding}" x2="${width - padding}" y2="${padding}" stroke="rgba(255,255,255,0.05)" stroke-dasharray="4"/>
            <line x1="${padding}" y1="${height/2}" x2="${width - padding}" y2="${height/2}" stroke="rgba(255,255,255,0.05)" stroke-dasharray="4"/>
            <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="rgba(255,255,255,0.1)"/>

            <!-- Area Fill -->
            <path d="${areaPath}" fill="url(#chartGradient)" />

            <!-- Curve Line -->
            <path d="${linePath}" fill="none" stroke="#00F2FE" stroke-width="3" stroke-linecap="round" />

            <!-- End Highlight Dot -->
            <circle cx="${points[points.length - 1].x}" cy="${points[points.length - 1].y}" r="6" fill="#00F2FE" stroke="#FFF" stroke-width="2" />
        `;
    }
}

// Bootstrap Application when DOM Ready
document.addEventListener("DOMContentLoaded", () => {
    const app = new AppUI();
    app.init();
});
