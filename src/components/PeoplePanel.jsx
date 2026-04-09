import { useState } from 'react'

export default function PeoplePanel({ people, balances, onAdd, onRemove }) {
  const [name, setName] = useState('')
  const [focused, setFocused] = useState(false)

  function handleAdd(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setName('')
  }

  return (
    <div style={styles.panel}>
      <SectionHeader
        title="Group Members"
        subtitle="Add everyone who's splitting expenses"
      />

      <form onSubmit={handleAdd} style={styles.form}>
        <div style={{ ...styles.inputWrap, ...(focused ? styles.inputWrapFocused : {}) }}>
          <span style={styles.inputIcon}>＋</span>
          <input
            style={styles.input}
            placeholder="Enter a name…"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoFocus
          />
        </div>
        <button
          type="submit"
          style={{ ...styles.addBtn, ...(name.trim() ? {} : styles.addBtnDisabled) }}
          disabled={!name.trim()}
        >
          Add Member
        </button>
      </form>

      {people.length === 0 ? (
        <EmptyState icon="👥" message="No members yet. Add someone to get started." />
      ) : (
        <ul style={styles.list}>
          {people.map((p) => {
            const bal = balances[p.id] ?? 0
            const isPos = bal > 0.005
            const isNeg = bal < -0.005
            return (
              <li key={p.id} style={styles.item}>
                <Avatar name={p.name} />
                <div style={styles.itemInfo}>
                  <span style={styles.itemName}>{p.name}</span>
                  {(isPos || isNeg) && (
                    <span
                      style={{
                        ...styles.balChip,
                        background: isPos ? 'var(--green-dim)' : 'var(--red-dim)',
                        color: isPos ? 'var(--green)' : 'var(--red)',
                        border: `1px solid ${isPos ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}`,
                      }}
                    >
                      {isPos ? `+$${bal.toFixed(2)}` : `-$${Math.abs(bal).toFixed(2)}`}
                    </span>
                  )}
                  {!isPos && !isNeg && (
                    <span style={styles.settledChip}>Settled</span>
                  )}
                </div>
                <button
                  style={styles.removeBtn}
                  onClick={() => onRemove(p.id)}
                  title="Remove member"
                >
                  ✕
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export function Avatar({ name, size = 38, ring = false }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')
  const hue = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `linear-gradient(135deg, hsl(${hue},60%,40%), hsl(${(hue + 30) % 360},55%,55%))`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.36,
        fontWeight: 700,
        color: '#fff',
        flexShrink: 0,
        letterSpacing: '-0.5px',
        boxShadow: ring
          ? `0 0 0 2px var(--bg), 0 0 0 3.5px hsl(${hue},55%,50%)`
          : `0 2px 8px rgba(0,0,0,0.3)`,
      }}
    >
      {initials}
    </div>
  )
}

export function SectionHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 5, letterSpacing: '-0.3px' }}>
        {title}
      </h2>
      {subtitle && <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.4 }}>{subtitle}</p>}
    </div>
  )
}

export function EmptyState({ icon, message }) {
  return (
    <div style={styles.empty}>
      <div style={styles.emptyIcon}>{icon}</div>
      <p style={styles.emptyText}>{message}</p>
    </div>
  )
}

const styles = {
  panel: { display: 'flex', flexDirection: 'column' },
  form: {
    display: 'flex',
    gap: 10,
    marginBottom: 24,
  },
  inputWrap: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: 'rgba(255,255,255,0.04)',
    border: '1.5px solid rgba(255,255,255,0.08)',
    borderRadius: 'var(--radius-sm)',
    padding: '0 14px',
    transition: 'all 0.18s ease',
  },
  inputWrapFocused: {
    border: '1.5px solid rgba(108,99,255,0.5)',
    boxShadow: '0 0 0 3px rgba(108,99,255,0.1)',
    background: 'rgba(108,99,255,0.05)',
  },
  inputIcon: {
    color: 'var(--text-muted)',
    fontSize: 18,
    flexShrink: 0,
    lineHeight: 1,
  },
  input: {
    flex: 1,
    background: 'transparent',
    color: 'var(--text)',
    fontSize: 14,
    padding: '11px 0',
  },
  addBtn: {
    background: 'linear-gradient(135deg, #6c63ff, #a78bfa)',
    color: '#fff',
    borderRadius: 'var(--radius-sm)',
    padding: '11px 22px',
    fontSize: 14,
    fontWeight: 600,
    flexShrink: 0,
    boxShadow: '0 4px 12px rgba(108,99,255,0.3)',
    letterSpacing: '0.1px',
  },
  addBtnDisabled: {
    opacity: 0.45,
    boxShadow: 'none',
  },
  list: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 13,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 'var(--radius)',
    padding: '13px 16px',
    transition: 'border-color 0.18s, background 0.18s',
  },
  itemInfo: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  itemName: { fontSize: 15, fontWeight: 600, color: 'var(--text)' },
  balChip: {
    fontSize: 12,
    fontWeight: 700,
    padding: '3px 9px',
    borderRadius: 99,
    letterSpacing: '0.2px',
  },
  settledChip: {
    fontSize: 11,
    fontWeight: 500,
    padding: '3px 9px',
    borderRadius: 99,
    background: 'rgba(255,255,255,0.05)',
    color: 'var(--text-muted)',
    border: '1px solid rgba(255,255,255,0.07)',
  },
  removeBtn: {
    background: 'transparent',
    color: 'var(--text-dim)',
    fontSize: 12,
    padding: '5px 7px',
    borderRadius: 7,
    flexShrink: 0,
  },
  empty: {
    textAlign: 'center',
    padding: '64px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 14,
  },
  emptyIcon: {
    fontSize: 48,
    width: 80,
    height: 80,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 24,
  },
  emptyText: {
    fontSize: 14,
    color: 'var(--text-muted)',
    maxWidth: 240,
    lineHeight: 1.6,
  },
}
