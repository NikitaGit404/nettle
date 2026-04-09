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
  const maxAbs = Math.max(...sorted.map((p) => Math.abs(balances[p.id] ?? 0)), 0.01)
  const allSettled = sorted.every((p) => Math.abs(balances[p.id] ?? 0) < 0.005)

  return (
    <div>
      <SectionHeader
        title="Balances"
        subtitle={allSettled ? 'Everyone is settled up!' : 'Net balance for each member'}
      />

      {allSettled ? (
        <div style={styles.settledBox}>
          <div style={styles.settledEmoji}>🎉</div>
          <p style={styles.settledTitle}>All Settled!</p>
          <p style={styles.settledSub}>No outstanding balances. Everyone's square.</p>
        </div>
      ) : (
        <div style={styles.cards}>
          {sorted.map((p) => {
            const bal = balances[p.id] ?? 0
            const pct = Math.abs(bal) / maxAbs
            const isPos = bal > 0.005
            const isNeg = bal < -0.005
            return <BalanceCard key={p.id} person={p} balance={bal} pct={pct} isPos={isPos} isNeg={isNeg} />
          })}
        </div>
      )}
    </div>
  )
}

function BalanceCard({ person, balance, pct, isPos, isNeg }) {
  const color = isPos ? 'var(--green)' : isNeg ? 'var(--red)' : 'var(--text-muted)'
  const gradStart = isPos ? '#34d399' : isNeg ? '#f87171' : '#4b5563'
  const gradEnd = isPos ? '#6ee7b7' : isNeg ? '#fca5a5' : '#6b7280'
  const dimBg = isPos ? 'var(--green-dim)' : isNeg ? 'var(--red-dim)' : 'rgba(255,255,255,0.03)'
  const label = isPos ? 'gets back' : isNeg ? 'owes' : 'settled'

  return (
    <div style={styles.card}>
      <Avatar name={person.name} size={42} ring />
      <div style={styles.cardBody}>
        <div style={styles.cardTop}>
          <span style={styles.name}>{person.name}</span>
          <span style={{ ...styles.amount, color }}>
            {isPos ? '+' : isNeg ? '-' : ''}${Math.abs(balance).toFixed(2)}
          </span>
        </div>
        <div style={styles.barRow}>
          <div style={styles.barTrack}>
            <div
              style={{
                ...styles.barFill,
                width: `${(pct * 100).toFixed(1)}%`,
                background: `linear-gradient(90deg, ${gradStart}, ${gradEnd})`,
                boxShadow: isPos
                  ? '0 0 8px rgba(52,211,153,0.4)'
                  : isNeg
                  ? '0 0 8px rgba(248,113,113,0.4)'
                  : 'none',
              }}
            />
          </div>
          <span
            style={{
              ...styles.labelChip,
              background: dimBg,
              color,
              border: `1px solid ${isPos ? 'rgba(52,211,153,0.2)' : isNeg ? 'rgba(248,113,113,0.2)' : 'rgba(255,255,255,0.08)'}`,
            }}
          >
            {label}
          </span>
        </div>
      </div>
    </div>
  )
}

const styles = {
  cards: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 'var(--radius)',
    padding: '16px 18px',
  },
  cardBody: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    minWidth: 0,
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: { fontSize: 15, fontWeight: 600, color: 'var(--text)' },
  amount: {
    fontSize: 18,
    fontWeight: 800,
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '-0.5px',
  },
  barRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  barTrack: {
    flex: 1,
    height: 6,
    background: 'rgba(255,255,255,0.06)',
    borderRadius: 99,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 99,
    minWidth: 4,
    transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  labelChip: {
    fontSize: 11,
    fontWeight: 600,
    padding: '3px 9px',
    borderRadius: 99,
    flexShrink: 0,
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  settledBox: {
    textAlign: 'center',
    padding: '64px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  settledEmoji: {
    fontSize: 48,
    width: 80,
    height: 80,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--green-dim)',
    border: '1px solid rgba(52,211,153,0.2)',
    borderRadius: 24,
    boxShadow: '0 0 24px rgba(52,211,153,0.15)',
  },
  settledTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: 'var(--green)',
  },
  settledSub: {
    fontSize: 14,
    color: 'var(--text-muted)',
    maxWidth: 240,
    lineHeight: 1.6,
  },
}
