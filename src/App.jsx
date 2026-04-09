import { useState, useMemo } from 'react'
import PeoplePanel from './components/PeoplePanel'
import ExpensePanel from './components/ExpensePanel'
import BalancePanel from './components/BalancePanel'
import SettlePanel from './components/SettlePanel'
import { computeBalances, minimizeTransactions } from './utils/splitAlgorithm'

const TABS = [
  { id: 'people',   label: 'People',    icon: '👥' },
  { id: 'expenses', label: 'Expenses',  icon: '💸' },
  { id: 'balances', label: 'Balances',  icon: '⚖️'  },
  { id: 'settle',   label: 'Settle Up', icon: '✅'  },
]

export default function App() {
  const [tab, setTab] = useState('people')
  const [people, setPeople] = useState([])
  const [expenses, setExpenses] = useState([])

  const balances = useMemo(() => computeBalances(people, expenses), [people, expenses])
  const settlements = useMemo(() => minimizeTransactions(balances), [balances])

  function addPerson(name) {
    setPeople((prev) => [...prev, { id: crypto.randomUUID(), name }])
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

  const totalSpend = expenses.reduce((s, e) => s + e.amount, 0)

  return (
    <div style={styles.shell}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <div style={styles.logoMark}>🌿</div>
          <div>
            <div style={styles.logoText}>Nettle</div>
            <div style={styles.logoSub}>Split Expenses Smartly</div>
          </div>
        </div>
        <div style={styles.stats}>
          <Stat label="People" value={people.length} />
          <div style={styles.statDivider} />
          <Stat label="Expenses" value={expenses.length} />
          <div style={styles.statDivider} />
          <Stat label="Total Spent" value={`$${totalSpend.toFixed(0)}`} accent />
        </div>
      </header>

      {/* Tab bar */}
      <nav style={styles.tabBar}>
        {TABS.map((t) => {
          const isActive = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{ ...styles.tab, ...(isActive ? styles.tabActive : {}) }}
            >
              <span style={styles.tabIcon}>{t.icon}</span>
              <span>{t.label}</span>
              {t.id === 'settle' && settlements.length > 0 && (
                <span style={styles.badge}>{settlements.length}</span>
              )}
              {isActive && <span style={styles.tabUnderline} />}
            </button>
          )
        })}
      </nav>

      {/* Content */}
      <main style={styles.main}>
        {tab === 'people' && (
          <PeoplePanel people={people} balances={balances} onAdd={addPerson} onRemove={removePerson} />
        )}
        {tab === 'expenses' && (
          <ExpensePanel people={people} expenses={expenses} personById={personById} onAdd={addExpense} onRemove={removeExpense} />
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

function Stat({ label, value, accent }) {
  return (
    <div style={styles.stat}>
      <span style={{ ...styles.statVal, ...(accent ? styles.statValAccent : {}) }}>{value}</span>
      <span style={styles.statLabel}>{label}</span>
    </div>
  )
}

const styles = {
  shell: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    maxWidth: 740,
    margin: '0 auto',
    padding: '0 20px 60px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '28px 0 24px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  logoMark: {
    fontSize: 32,
    width: 48,
    height: 48,
    background: 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(167,139,250,0.1))',
    border: '1px solid rgba(108,99,255,0.25)',
    borderRadius: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 20px rgba(108,99,255,0.15)',
  },
  logoText: {
    fontSize: 22,
    fontWeight: 800,
    background: 'linear-gradient(135deg, #a78bfa, #c4b5fd)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    letterSpacing: '-0.5px',
    lineHeight: 1.1,
  },
  logoSub: {
    fontSize: 11,
    color: 'var(--text-muted)',
    letterSpacing: '0.3px',
    marginTop: 2,
  },
  stats: {
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 14,
    padding: '10px 20px',
  },
  statDivider: {
    width: 1,
    height: 28,
    background: 'rgba(255,255,255,0.07)',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
  },
  statVal: {
    fontSize: 18,
    fontWeight: 700,
    lineHeight: 1,
    color: 'var(--text)',
  },
  statValAccent: {
    background: 'linear-gradient(135deg, #a78bfa, #c4b5fd)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  statLabel: {
    fontSize: 10,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    fontWeight: 500,
  },
  tabBar: {
    display: 'flex',
    gap: 2,
    padding: '16px 0 4px',
  },
  tab: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    padding: '10px 12px',
    borderRadius: 'var(--radius-sm)',
    background: 'transparent',
    color: 'var(--text-muted)',
    fontSize: 13,
    fontWeight: 500,
    position: 'relative',
    overflow: 'hidden',
  },
  tabActive: {
    background: 'rgba(108,99,255,0.1)',
    color: '#c4b5fd',
  },
  tabIcon: { fontSize: 15 },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: '15%',
    right: '15%',
    height: 2,
    background: 'linear-gradient(90deg, #6c63ff, #a78bfa)',
    borderRadius: 2,
  },
  badge: {
    background: 'linear-gradient(135deg, #6c63ff, #a78bfa)',
    color: '#fff',
    borderRadius: 99,
    fontSize: 10,
    fontWeight: 700,
    padding: '2px 7px',
    lineHeight: 1.5,
    boxShadow: '0 0 8px rgba(108,99,255,0.4)',
  },
  main: {
    flex: 1,
    paddingTop: 24,
  },
}
