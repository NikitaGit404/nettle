/**
 * Compute net balance for each person across all expenses.
 * Positive balance = they are owed money.
 * Negative balance = they owe money.
 */
export function computeBalances(people, expenses) {
  const balances = {}
  people.forEach((p) => (balances[p.id] = 0))

  expenses.forEach(({ paidBy, amount, splitAmong }) => {
    if (!splitAmong.length) return
    const share = amount / splitAmong.length
    balances[paidBy] = (balances[paidBy] || 0) + amount
    splitAmong.forEach((personId) => {
      balances[personId] = (balances[personId] || 0) - share
    })
  })

  return balances
}

/**
 * Greedy algorithm to minimize the number of transactions needed to settle all debts.
 *
 * Strategy:
 *   1. Separate people into creditors (positive balance) and debtors (negative balance).
 *   2. Always match the largest creditor with the largest debtor.
 *   3. Settle the minimum of the two amounts, reducing the number of open balances.
 *
 * This produces at most (n - 1) transactions for n people, which is optimal in most cases.
 */
export function minimizeTransactions(balances) {
  const EPS = 0.005 // half-cent threshold to avoid floating-point noise

  const creditors = [] // { id, amount } — they are owed
  const debtors = []   // { id, amount } — they owe (amount is positive here)

  Object.entries(balances).forEach(([id, bal]) => {
    if (bal > EPS) creditors.push({ id, amount: bal })
    else if (bal < -EPS) debtors.push({ id, amount: -bal })
  })

  const settlements = []

  while (creditors.length && debtors.length) {
    // Always work with the largest amounts to converge fastest
    creditors.sort((a, b) => b.amount - a.amount)
    debtors.sort((a, b) => b.amount - a.amount)

    const creditor = creditors[0]
    const debtor = debtors[0]
    const settle = Math.min(creditor.amount, debtor.amount)

    settlements.push({
      from: debtor.id,
      to: creditor.id,
      amount: Math.round(settle * 100) / 100,
    })

    creditor.amount -= settle
    debtor.amount -= settle

    if (creditor.amount < EPS) creditors.shift()
    if (debtor.amount < EPS) debtors.shift()
  }

  return settlements
}
