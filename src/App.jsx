import { useState, useMemo } from 'react'
import PeoplePanel from './components/PeoplePanel'
import ExpensePanel from './components/ExpensePanel'
import BalancePanel from './components/BalancePanel'
import SettlePanel from './components/SettlePanel'
import { computeBalances, minimizeTransactions } from './utils/splitAlgorithm'

const TABS = [
  { id: 'people',   label: 'People',      icon: '👥' },
  { id: 'expenses', label: 'Expenses',    icon: '💸' },
  { id: 'balances', label: 'Balances',    icon: '⚖️'  },
  { id: 'settle',   label: 'Settle Up',   icon: '✅'  },
]

export default function App() {
  const [tab, setTab] = useState('people')
  const [people, setPeople] = useState([])
  const [expenses, setExpenses] = useState([])

  const balances = useMemo(() => computeBalances(people, expenses), [people, expenses])
  const settlements = useMemo(() => minimizeTransactions(balances), [balances])

  function addPerson(name) {
    const id = crypto.randomUUID()
    setPeople((prev) => [...prev, { id, name }])
  }

  function removePerson(id) {
    setPeople((prev) => prev.filter((p) => p.id !== id))
    setExpenses((prev) =>
      prev
        .filter((e) => e.paidBy !== id)
        .map((e) => ({ ...e, splitAmong: e.splitAmong.filter((pid) => pid !== id) }))
        .filter((e) => e.splitAmong.length > 0)
    )
  }

  function addExpense(expense) {
    setExpenses((prev) => [...prev, { id: crypto.randomUUID(), ...expense }])
  }

  function removeExpense(id) {
    setExpenses((prev) => prev.filter((e) => e.id !== id))
  }

  const personById = useMemo(() => {
    const map = {}
    people.forEach((p) => (map[p.id] = p))
    return map
  }, [people])

  return (
    <div style={styles.shell}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>🌿</span>
          <span style={styles.logoText}>Nettle</span>
          <span style={styles.logoSub}>Split Expenses Smartly</span>
        </div>
        <div style={styles.stats}>
          <Stat label="People" value={people.length} />
          <Stat label="Expenses" value={expenses.length} />
          <Stat label="Settlements" value={settlements.length} color="var(--accent-light)" />
        </div>
      </header>

      {/* Tab bar */}
      <nav style={styles.tabBar}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{ ...styles.tab, ...(tab === t.id ? styles.tabActive : {}) }}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
            {t.id === 'settle' && settlements.length > 0 && (
              <span style={styles.badge}>{settlements.length}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main style={styles.main}>
        {tab === 'people' && (
          <PeoplePanel
            people={people}
            balances={balances}
            onAdd={addPerson}
            onRemove={removePerson}
          />
        )}
        {tab === 'expenses' && (
          <ExpensePanel
            people={people}
            expenses={expenses}
            personById={personById}
            onAdd={addExpense}
            onRemove={removeExpense}
          />
        )}
        {tab === 'balances' && (
          <BalancePanel people={people} balances={balances} personById={personById} />
        )}
        {tab === 'settle' && (
          <SettlePanel settlements={settlements} personById={personById} />
        )}
      </main>
    </div>
  )
}

function Stat({ label, value, color }) {
  return (
    <div style={styles.stat}>
      <span style={{ ...styles.statVal, color: color || 'var(--text)' }}>{value}</span>
      <span style={styles.statLabel}>{label}</span>
    </div>
  )
}

const styles = {
  shell: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    maxWidth: 720,
    margin: '0 auto',
    padding: '0 16px 40px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px 0 20px',
    borderBottom: '1px solid var(--border)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: { fontSize: 28 },
  logoText: {
    fontSize: 22,
    fontWeight: 700,
    color: 'var(--accent-light)',
    letterSpacing: '-0.5px',
  },
  logoSub: {
    fontSize: 12,
    color: 'var(--text-muted)',
    marginLeft: 4,
    fontWeight: 400,
  },
  stats: {
    display: 'flex',
    gap: 24,
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 1,
  },
  statVal: {
    fontSize: 20,
    fontWeight: 700,
    lineHeight: 1,
  },
  statLabel: {
    fontSize: 11,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tabBar: {
    display: 'flex',
    gap: 4,
    padding: '12px 0',
  },
  tab: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '9px 12px',
    borderRadius: 'var(--radius-sm)',
    background: 'transparent',
    color: 'var(--text-muted)',
    fontSize: 13,
    fontWeight: 500,
    position: 'relative',
  },
  tabActive: {
    background: 'var(--accent-dim)',
    color: 'var(--accent-light)',
  },
  badge: {
    background: 'var(--accent)',
    color: '#fff',
    borderRadius: 99,
    fontSize: 10,
    fontWeight: 700,
    padding: '1px 6px',
    lineHeight: 1.6,
  },
  main: {
    flex: 1,
    paddingTop: 8,
  },
}
