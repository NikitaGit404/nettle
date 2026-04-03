# 🌿 Nettle — Split Expenses Smartly

A lightweight React app for splitting group expenses and settling debts with the minimum number of transactions.

## Features

- **People** — Add and remove group members
- **Expenses** — Log expenses with description, amount, category, payer, and split (equal or custom)
- **Balances** — Visual overview of each person's net balance
- **Settle Up** — Optimal settlement plan that minimizes the number of payments needed

## The Algorithm

Nettle uses a **greedy graph algorithm** to minimize transactions:

1. Compute each person's **net balance** — total paid minus total owed
2. Split into **creditors** (positive balance) and **debtors** (negative balance)
3. At each step, match the **largest creditor** with the **largest debtor**
4. Settle the minimum of the two amounts and repeat

This produces at most **n − 1 transactions** for n people, which is optimal in the general case.

**Example:** 5 people with tangled debts might naively require 10 transfers. Nettle reduces this to 4.

## Getting Started

```bash
npm install
npm run dev
```

App runs at `http://localhost:5173`.

## Project Structure

```
src/
├── utils/
│   └── splitAlgorithm.js   # Balance computation + minimize transactions
├── components/
│   ├── PeoplePanel.jsx      # Add/remove group members
│   ├── ExpensePanel.jsx     # Log and manage expenses
│   ├── BalancePanel.jsx     # Net balance visualization
│   └── SettlePanel.jsx      # Minimized settlement plan
└── App.jsx                  # Root state and navigation
```

## Tech Stack

- [React 18](https://react.dev/) — UI
- [Vite](https://vitejs.dev/) — Build tool
- No external UI libraries — custom CSS with CSS variables
