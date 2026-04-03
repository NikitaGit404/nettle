import { useState } from 'react'
import { Avatar, SectionHeader, EmptyState } from './PeoplePanel'

export default function SettlePanel({ settlements, personById }) {
  const [done, setDone] = useState(new Set())

  function toggle(idx) {
    setDone((prev) => {
      const next = new Set(prev)
      next.has(idx) ? next.delete(idx) : next.add(idx)
      return next
    })
  }

  function markAll() {
    setDone(new Set(settlements.map((_, i) => i)))
  }

  function clearAll() {
    setDone(new Set())
  }

  const allDone = done.size === settlements.length && settlements.length > 0
  const remaining = settlements.length - done.size

  return (
    <div>
      <div style={styles.headerRow}>
        <SectionHeader
          title="Settle Up"
          subtitle={
            settlements.length === 0
              ? 'No settlements needed'
              : `${settlements.length} transaction${settlements.length !== 1 ? 's' : ''} to settle all debts · ${remaining} remaining`
          }
        />
        {settlements.length > 0 && (
          <div style={styles.headerActions}>
            {!allDone ? (
              <button style={styles.actionBtn} onClick={markAll}>Mark all done</button>
            ) : (
              <button style={styles.actionBtn} onClick={clearAll}>Reset</button>
            )}
          </div>
        )}
      </div>

      {settlements.length === 0 ? (
        <EmptyState icon="✅" message="Nothing to settle. Either add expenses or everyone's square!" />
      ) : (
        <>
          <AlgoNote count={settlements.length} total={personById ? Object.keys(personById).length : 0} />

          <ul style={styles.list}>
            {settlements.map((s, idx) => {
              const from = personById[s.from]
              const to = personById[s.to]
              const isDone = done.has(idx)
              return (
                <li
                  key={idx}
                  style={{
                    ...styles.card,
                    opacity: isDone ? 0.45 : 1,
                  }}
                >
                  <div style={styles.step}>
                    <span style={styles.stepNum}>{idx + 1}</span>
                  </div>

                  <div style={styles.cardBody}>
                    <div style={styles.transfer}>
                      <div style={styles.person}>
                        <Avatar name={from?.name ?? '?'} size={38} />
                        <span style={styles.personName}>{from?.name ?? '?'}</span>
                        <span style={styles.role}>pays</span>
                      </div>

                      <div style={styles.arrow}>
                        <div style={styles.amountPill}>${s.amount.toFixed(2)}</div>
                        <div style={styles.arrowLine} />
                        <div style={styles.arrowHead}>▶</div>
                      </div>

                      <div style={styles.person}>
                        <Avatar name={to?.name ?? '?'} size={38} />
                        <span style={styles.personName}>{to?.name ?? '?'}</span>
                        <span style={styles.role}>receives</span>
                      </div>
                    </div>
                  </div>

                  <button
                    style={{
                      ...styles.doneBtn,
                      background: isDone ? 'var(--green-dim)' : 'var(--surface2)',
                      color: isDone ? 'var(--green)' : 'var(--text-muted)',
                      border: `1.5px solid ${isDone ? 'var(--green)' : 'var(--border)'}`,
                    }}
                    onClick={() => toggle(idx)}
                  >
                    {isDone ? '✓ Done' : 'Mark done'}
                  </button>
                </li>
              )
            })}
          </ul>

          {allDone && (
            <div style={styles.allDone}>
              <span style={{ fontSize: 28 }}>🎉</span>
              <span style={{ fontWeight: 700, color: 'var(--green)', fontSize: 16 }}>
                All settled up!
              </span>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function AlgoNote({ count, total }) {
  const maxPossible = Math.max(total - 1, 0)
  return (
    <div style={styles.algoNote}>
      <span style={styles.algoIcon}>⚡</span>
      <div>
        <span style={{ fontWeight: 600, color: 'var(--accent-light)' }}>
          Minimized to {count} transaction{count !== 1 ? 's' : ''}
        </span>
        {maxPossible > 0 && (
          <span style={{ color: 'var(--text-muted)', marginLeft: 6 }}>
            (max possible: {maxPossible} for {total} people)
          </span>
        )}
        <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 3 }}>
          Greedy graph algorithm: at each step, the largest creditor is matched with the largest debtor.
        </div>
      </div>
    </div>
  )
}

const styles = {
  headerRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerActions: {
    marginTop: 4,
  },
  actionBtn: {
    background: 'var(--surface)',
    color: 'var(--text-muted)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '7px 14px',
    fontSize: 13,
    fontWeight: 500,
  },
  algoNote: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    background: 'var(--accent-dim)',
    border: '1px solid rgba(108,99,255,0.25)',
    borderRadius: 'var(--radius)',
    padding: '12px 16px',
    marginBottom: 16,
    fontSize: 13,
  },
  algoIcon: { fontSize: 18, flexShrink: 0 },
  list: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    transition: 'opacity 0.2s ease',
  },
  step: {
    flexShrink: 0,
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: 'var(--surface2)',
    border: '1.5px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 700,
    color: 'var(--text-muted)',
  },
  cardBody: {
    flex: 1,
  },
  transfer: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  person: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    minWidth: 70,
  },
  personName: {
    fontSize: 13,
    fontWeight: 600,
    textAlign: 'center',
  },
  role: {
    fontSize: 11,
    color: 'var(--text-dim)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  arrow: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  amountPill: {
    background: 'var(--yellow-dim)',
    color: 'var(--yellow)',
    border: '1.5px solid rgba(245,158,11,0.3)',
    borderRadius: 99,
    padding: '3px 12px',
    fontSize: 15,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
  },
  arrowLine: {
    height: 2,
    width: '80%',
    background: 'var(--border)',
  },
  arrowHead: {
    fontSize: 12,
    color: 'var(--text-dim)',
    marginTop: -6,
  },
  doneBtn: {
    borderRadius: 'var(--radius-sm)',
    padding: '8px 14px',
    fontSize: 12,
    fontWeight: 600,
    flexShrink: 0,
    minWidth: 88,
    textAlign: 'center',
  },
  allDone: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 24,
    padding: '20px',
    background: 'var(--green-dim)',
    border: '1px solid rgba(34,197,94,0.25)',
    borderRadius: 'var(--radius)',
  },
}
