import { useState } from 'react'

export default function PeoplePanel({ people, balances, onAdd, onRemove }) {
  const [name, setName] = useState('')

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
        <input
          style={styles.input}
          placeholder="Enter a name…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <button type="submit" style={styles.addBtn} disabled={!name.trim()}>
          Add
        </button>
      </form>

      {people.length === 0 ? (
        <EmptyState icon="👥" message="No members yet. Add someone above." />
      ) : (
        <ul style={styles.list}>
          {people.map((p) => {
            const bal = balances[p.id] ?? 0
            return (
              <li key={p.id} style={styles.item}>
                <Avatar name={p.name} />
                <div style={styles.itemInfo}>
                  <span style={styles.itemName}>{p.name}</span>
                  {bal !== 0 && (
                    <span
                      style={{
                        ...styles.balChip,
                        background: bal > 0 ? 'var(--green-dim)' : 'var(--red-dim)',
                        color: bal > 0 ? 'var(--green)' : 'var(--red)',
                      }}
                    >
                      {bal > 0 ? `+$${bal.toFixed(2)}` : `-$${Math.abs(bal).toFixed(2)}`}
                    </span>
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

export function Avatar({ name, size = 36 }) {
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
        background: `hsl(${hue}, 55%, 38%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.38,
        fontWeight: 600,
        color: '#fff',
        flexShrink: 0,
        letterSpacing: '-0.5px',
      }}
    >
      {initials}
    </div>
  )
}

export function SectionHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
        {title}
      </h2>
      {subtitle && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{subtitle}</p>}
    </div>
  )
}

export function EmptyState({ icon, message }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-dim)' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <p style={{ fontSize: 14 }}>{message}</p>
    </div>
  )
}

const styles = {
  panel: { display: 'flex', flexDirection: 'column', gap: 0 },
  form: {
    display: 'flex',
    gap: 8,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    background: 'var(--surface)',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 14px',
    color: 'var(--text)',
    fontSize: 14,
  },
  addBtn: {
    background: 'var(--accent)',
    color: '#fff',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: 600,
    opacity: 1,
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
    gap: 12,
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '12px 14px',
  },
  itemInfo: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  itemName: { fontSize: 15, fontWeight: 500 },
  balChip: {
    fontSize: 12,
    fontWeight: 600,
    padding: '3px 8px',
    borderRadius: 99,
  },
  removeBtn: {
    background: 'transparent',
    color: 'var(--text-dim)',
    fontSize: 13,
    padding: '4px 6px',
    borderRadius: 6,
  },
}
