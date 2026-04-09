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
              : `${remaining} of ${settlements.length} payment${settlements.length !== 1 ? 's' : ''} remaining`
          }
        />
        {settlements.length > 0 && (
          <button
            style={styles.actionBtn}
            onClick={() =>
              allDone ? setDone(new Set()) : setDone(new Set(settlements.map((_, i) => i)))
            }
          >
            {allDone ? 'Reset' : 'Mark all done'}
          </button>
        )}
      </div>

      {settlements.length === 0 ? (
        <EmptyState icon="✅" message="Nothing to settle. Add expenses or everyone's already square!" />
      ) : (
        <>
          <AlgoNote count={settlements.length} total={Object.keys(personById).length} />

          <ul style={styles.list}>
            {settlements.map((s, idx) => {
              const from = personById[s.from]
              const to = personById[s.to]
              const isDone = done.has(idx)
              return (
                <li key={idx} style={{ ...styles.card, ...(isDone ? styles.cardDone : {}) }}>
                  {/* Step number */}
                  <div style={{ ...styles.stepBadge, ...(isDone ? styles.stepBadgeDone : {}) }}>
                    {isDone ? '✓' : idx + 1}
                  </div>

                  {/* Transfer layout */}
                  <div style={styles.transfer}>
                    <PersonNode name={from?.name ?? '?'} label="pays" />

                    <div style={styles.arrowWrap}>
                      <div style={styles.amountPill}>
                        ${s.amount.toFixed(2)}
                      </div>
                      <div style={styles.arrowTrack}>
                        <div style={styles.arrowFill} />
                        <span style={styles.arrowHead}>▶</span>
                      </div>
                    </div>

                    <PersonNode name={to?.name ?? '?'} label="receives" />
                  </div>

                  {/* Mark done button */}
                  <button
                    style={{
                      ...styles.doneBtn,
                      ...(isDone ? styles.doneBtnActive : {}),
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
            <div style={styles.celebration}>
              <span style={{ fontSize: 28 }}>🎉</span>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--green)', fontSize: 16 }}>All settled up!</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Every debt has been cleared.</div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function PersonNode({ name, label }) {
  return (
    <div style={styles.personNode}>
      <Avatar name={name} size={42} ring />
      <span style={styles.personName}>{name}</span>
      <span style={styles.personLabel}>{label}</span>
    </div>
  )
}

function AlgoNote({ count, total }) {
  const maxPossible = Math.max(total - 1, 0)
  return (
    <div style={styles.algoNote}>
      <span style={styles.algoIcon}>⚡</span>
      <div style={{ lineHeight: 1.5 }}>
        <span style={{ fontWeight: 600, color: '#c4b5fd' }}>
          Minimized to {count} transaction{count !== 1 ? 's' : ''}
        </span>
        {maxPossible > 0 && (
          <span style={{ color: 'var(--text-muted)', marginLeft: 8, fontSize: 12 }}>
            (max for {total} people: {maxPossible})
          </span>
        )}
        <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 3 }}>
          Greedy graph algorithm — largest creditor matched with largest debtor at each step.
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
    marginBottom: 0,
  },
  actionBtn: {
    background: 'rgba(255,255,255,0.05)',
    color: 'var(--text-muted)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 'var(--radius-sm)',
    padding: '8px 14px',
    fontSize: 13,
    fontWeight: 500,
    marginTop: 4,
    flexShrink: 0,
  },
  algoNote: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 11,
    background: 'rgba(108,99,255,0.08)',
    border: '1px solid rgba(108,99,255,0.18)',
    borderRadius: 'var(--radius)',
    padding: '13px 16px',
    marginBottom: 16,
    fontSize: 13,
  },
  algoIcon: { fontSize: 17, flexShrink: 0, marginTop: 1 },
  list: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  card: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 'var(--radius)',
    padding: '18px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    transition: 'opacity 0.25s ease, border-color 0.25s ease',
  },
  cardDone: {
    opacity: 0.4,
    borderColor: 'rgba(52,211,153,0.15)',
  },
  stepBadge: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.05)',
    border: '1.5px solid rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 700,
    color: 'var(--text-muted)',
    flexShrink: 0,
    transition: 'all 0.2s',
  },
  stepBadgeDone: {
    background: 'var(--green-dim)',
    border: '1.5px solid rgba(52,211,153,0.3)',
    color: 'var(--green)',
  },
  transfer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },
  personNode: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 5,
    minWidth: 72,
  },
  personName: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text)',
    textAlign: 'center',
  },
  personLabel: {
    fontSize: 10,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  arrowWrap: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
  },
  amountPill: {
    background: 'rgba(251,191,36,0.1)',
    color: 'var(--yellow)',
    border: '1.5px solid rgba(251,191,36,0.25)',
    borderRadius: 99,
    padding: '4px 14px',
    fontSize: 15,
    fontWeight: 800,
    fontVariantNumeric: 'tabular-nums',
    boxShadow: '0 0 12px rgba(251,191,36,0.1)',
    letterSpacing: '-0.3px',
  },
  arrowTrack: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    gap: 0,
  },
  arrowFill: {
    flex: 1,
    height: 1.5,
    background: 'linear-gradient(90deg, rgba(255,255,255,0.08), rgba(255,255,255,0.15))',
  },
  arrowHead: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.3)',
    marginLeft: 2,
  },
  doneBtn: {
    background: 'rgba(255,255,255,0.05)',
    color: 'var(--text-muted)',
    border: '1.5px solid rgba(255,255,255,0.1)',
    borderRadius: 'var(--radius-sm)',
    padding: '8px 14px',
    fontSize: 12,
    fontWeight: 600,
    flexShrink: 0,
    minWidth: 94,
    textAlign: 'center',
    transition: 'all 0.2s ease',
  },
  doneBtnActive: {
    background: 'var(--green-dim)',
    color: 'var(--green)',
    border: '1.5px solid rgba(52,211,153,0.3)',
    boxShadow: '0 0 12px rgba(52,211,153,0.1)',
  },
  celebration: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    marginTop: 20,
    padding: '20px 24px',
    background: 'var(--green-dim)',
    border: '1px solid rgba(52,211,153,0.2)',
    borderRadius: 'var(--radius)',
    boxShadow: '0 0 20px rgba(52,211,153,0.08)',
  },
}
