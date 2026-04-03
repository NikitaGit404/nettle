import { Avatar, SectionHeader, EmptyState } from './PeoplePanel'

export default function BalancePanel({ people, balances, personById }) {
  if (people.length === 0) {
    return (
      <div>
        <SectionHeader title="Balances" subtitle="Net balance per person" />
        <EmptyState icon="⚖️" message="Add people and expenses to see balances." />
      </div>
    )
  }

  const sorted = [...people].sort((a, b) => (balances[b.id] ?? 0) - (balances[a.id] ?? 0))
  const total = Object.values(balances).reduce((s, v) => s + Math.abs(v), 0)

  const allSettled = sorted.every((p) => Math.abs(balances[p.id] ?? 0) < 0.005)

  return (
    <div>
      <SectionHeader
        title="Balances"
        subtitle={allSettled ? 'All settled up! 🎉' : 'Who owes whom at a glance'}
      />

      {allSettled ? (
        <div style={styles.settled}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
          <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--green)', marginBottom: 6 }}>
            All Settled!
          </p>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            No outstanding balances. Everyone's square.
          </p>
        </div>
      ) : (
        <>
          <div style={styles.cards}>
            {sorted.map((p) => {
              const bal = balances[p.id] ?? 0
              const pct = total > 0 ? Math.abs(bal) / (total / 2) : 0
              return <BalanceCard key={p.id} person={p} balance={bal} pct={Math.min(pct, 1)} />
            })}
          </div>

          <div style={styles.legend}>
            <span style={{ color: 'var(--green)', fontWeight: 600 }}>■ Gets back</span>
            <span style={{ color: 'var(--red)', fontWeight: 600 }}>■ Owes</span>
          </div>
        </>
      )}
    </div>
  )
}

function BalanceCard({ person, balance, pct }) {
  const isPositive = balance >= 0
  const color = isPositive ? 'var(--green)' : 'var(--red)'
  const dimColor = isPositive ? 'var(--green-dim)' : 'var(--red-dim)'
  const label = isPositive ? 'gets back' : 'owes'

  return (
    <div style={styles.card}>
      <div style={styles.cardLeft}>
        <Avatar name={person.name} />
        <div>
          <div style={styles.name}>{person.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {Math.abs(balance) < 0.005
              ? 'All settled'
              : `${label} $${Math.abs(balance).toFixed(2)}`}
          </div>
        </div>
      </div>
      <div style={styles.barWrap}>
        <div
          style={{
            ...styles.bar,
            width: `${(pct * 100).toFixed(1)}%`,
            background: dimColor,
            borderRight: `3px solid ${color}`,
          }}
        />
      </div>
      <div style={{ ...styles.amount, color }}>
        {balance >= 0 ? '+' : ''}${balance.toFixed(2)}
      </div>
    </div>
  )
}

const styles = {
  cards: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  cardLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: 180,
    flexShrink: 0,
  },
  name: { fontSize: 14, fontWeight: 600 },
  barWrap: {
    flex: 1,
    height: 20,
    background: 'var(--surface2)',
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  bar: {
    height: '100%',
    borderRadius: 6,
    minWidth: 4,
    transition: 'width 0.3s ease',
  },
  amount: {
    fontSize: 16,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    minWidth: 80,
    textAlign: 'right',
    flexShrink: 0,
  },
  settled: {
    textAlign: 'center',
    padding: '60px 0',
  },
  legend: {
    display: 'flex',
    gap: 20,
    justifyContent: 'center',
    marginTop: 16,
    fontSize: 12,
    color: 'var(--text-muted)',
  },
}
