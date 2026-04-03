import { useState, useEffect } from 'react'
import { Avatar, SectionHeader, EmptyState } from './PeoplePanel'

const CATEGORIES = [
  { id: 'food',      label: 'Food',      icon: '🍕' },
  { id: 'travel',   label: 'Travel',    icon: '✈️' },
  { id: 'stay',     label: 'Stay',      icon: '🏨' },
  { id: 'drinks',   label: 'Drinks',    icon: '🍻' },
  { id: 'shopping', label: 'Shopping',  icon: '🛍️' },
  { id: 'other',    label: 'Other',     icon: '📦' },
]

function getCategoryIcon(id) {
  return CATEGORIES.find((c) => c.id === id)?.icon ?? '📦'
}

const SPLIT_MODES = [
  { id: 'equal', label: 'Split equally' },
  { id: 'custom', label: 'Custom split' },
]

export default function ExpensePanel({ people, expenses, personById, onAdd, onRemove }) {
  const [showForm, setShowForm] = useState(false)

  if (people.length < 2 && !showForm) {
    return (
      <div style={styles.panel}>
        <SectionHeader title="Expenses" subtitle="Track what was spent and by whom" />
        <EmptyState icon="👥" message="Add at least 2 people before adding expenses." />
      </div>
    )
  }

  return (
    <div style={styles.panel}>
      <div style={styles.headerRow}>
        <SectionHeader title="Expenses" subtitle={`${expenses.length} expense${expenses.length !== 1 ? 's' : ''} recorded`} />
        {!showForm && (
          <button style={styles.newBtn} onClick={() => setShowForm(true)}>
            + Add Expense
          </button>
        )}
      </div>

      {showForm && (
        <ExpenseForm
          people={people}
          onAdd={(exp) => { onAdd(exp); setShowForm(false) }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {expenses.length === 0 && !showForm ? (
        <EmptyState icon="💸" message="No expenses yet. Add the first one above." />
      ) : (
        <ul style={styles.list}>
          {[...expenses].reverse().map((exp) => {
            const payer = personById[exp.paidBy]
            const perPerson = exp.amount / exp.splitAmong.length
            return (
              <li key={exp.id} style={styles.card}>
                <div style={styles.cardTop}>
                  <span style={styles.catIcon}>{getCategoryIcon(exp.category)}</span>
                  <div style={styles.cardInfo}>
                    <span style={styles.cardTitle}>{exp.description}</span>
                    <span style={styles.cardMeta}>
                      Paid by <strong>{payer?.name ?? '?'}</strong> · split {exp.splitAmong.length} way{exp.splitAmong.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div style={styles.cardRight}>
                    <span style={styles.cardAmount}>${exp.amount.toFixed(2)}</span>
                    <span style={styles.cardPer}>${perPerson.toFixed(2)}/person</span>
                  </div>
                  <button style={styles.removeBtn} onClick={() => onRemove(exp.id)} title="Delete expense">✕</button>
                </div>
                <div style={styles.cardParticipants}>
                  {exp.splitAmong.map((pid) => (
                    <div key={pid} style={styles.participant}>
                      <Avatar name={personById[pid]?.name ?? '?'} size={22} />
                      <span style={styles.participantName}>{personById[pid]?.name ?? '?'}</span>
                    </div>
                  ))}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function ExpenseForm({ people, onAdd, onCancel }) {
  const [desc, setDesc] = useState('')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState(people[0]?.id ?? '')
  const [category, setCategory] = useState('food')
  const [splitMode, setSplitMode] = useState('equal')
  const [splitAmong, setSplitAmong] = useState(() => people.map((p) => p.id))
  const [customAmounts, setCustomAmounts] = useState(() => {
    const obj = {}
    people.forEach((p) => (obj[p.id] = ''))
    return obj
  })

  useEffect(() => {
    if (splitMode === 'equal') setSplitAmong(people.map((p) => p.id))
  }, [splitMode, people])

  function togglePerson(id) {
    setSplitAmong((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const totalCustom = Object.values(customAmounts).reduce((s, v) => s + (parseFloat(v) || 0), 0)
  const amountNum = parseFloat(amount) || 0

  function handleSubmit(e) {
    e.preventDefault()
    if (!desc.trim() || amountNum <= 0 || splitAmong.length === 0) return
    if (splitMode === 'custom') {
      const diff = Math.abs(totalCustom - amountNum)
      if (diff > 0.01) return
    }
    onAdd({ description: desc.trim(), amount: amountNum, paidBy, category, splitAmong })
  }

  const canSubmit =
    desc.trim() &&
    amountNum > 0 &&
    splitAmong.length > 0 &&
    (splitMode === 'equal' || Math.abs(totalCustom - amountNum) < 0.01)

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.formTitle}>New Expense</div>

      {/* Description */}
      <Field label="Description">
        <input
          style={styles.input}
          placeholder="e.g. Dinner at Pizzeria"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          autoFocus
        />
      </Field>

      {/* Amount + Category */}
      <div style={styles.row}>
        <Field label="Amount ($)" style={{ flex: 1 }}>
          <input
            style={styles.input}
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </Field>
        <Field label="Category" style={{ flex: 1 }}>
          <select
            style={styles.select}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/* Paid by */}
      <Field label="Paid by">
        <select
          style={styles.select}
          value={paidBy}
          onChange={(e) => setPaidBy(e.target.value)}
        >
          {people.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </Field>

      {/* Split mode */}
      <Field label="Split">
        <div style={styles.segmented}>
          {SPLIT_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              style={{
                ...styles.segment,
                ...(splitMode === m.id ? styles.segmentActive : {}),
              }}
              onClick={() => setSplitMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </Field>

      {/* Split among */}
      <Field label={splitMode === 'equal' ? 'Split among' : 'Custom amounts'}>
        <div style={styles.checkList}>
          {people.map((p) => {
            const checked = splitAmong.includes(p.id)
            return (
              <div key={p.id} style={styles.checkRow}>
                <label style={styles.checkLabel}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => togglePerson(p.id)}
                  />
                  <Avatar name={p.name} size={24} />
                  <span style={{ fontSize: 14 }}>{p.name}</span>
                </label>
                {splitMode === 'equal' && checked && amountNum > 0 && (
                  <span style={styles.shareHint}>
                    ${(amountNum / splitAmong.length).toFixed(2)}
                  </span>
                )}
                {splitMode === 'custom' && (
                  <input
                    style={{ ...styles.input, width: 90, textAlign: 'right' }}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={customAmounts[p.id]}
                    onChange={(e) =>
                      setCustomAmounts((prev) => ({ ...prev, [p.id]: e.target.value }))
                    }
                  />
                )}
              </div>
            )
          })}
        </div>
        {splitMode === 'custom' && amountNum > 0 && (
          <div style={styles.customTotal}>
            <span>Total assigned:</span>
            <span
              style={{
                fontWeight: 600,
                color: Math.abs(totalCustom - amountNum) < 0.01 ? 'var(--green)' : 'var(--red)',
              }}
            >
              ${totalCustom.toFixed(2)} / ${amountNum.toFixed(2)}
            </span>
          </div>
        )}
      </Field>

      <div style={styles.formActions}>
        <button type="button" style={styles.cancelBtn} onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" style={styles.submitBtn} disabled={!canSubmit}>
          Add Expense
        </button>
      </div>
    </form>
  )
}

function Field({ label, children, style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const styles = {
  panel: { display: 'flex', flexDirection: 'column', gap: 0 },
  headerRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  newBtn: {
    background: 'var(--accent)',
    color: '#fff',
    borderRadius: 'var(--radius-sm)',
    padding: '9px 16px',
    fontSize: 13,
    fontWeight: 600,
    marginTop: 2,
    flexShrink: 0,
  },
  form: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--text)',
    marginBottom: 4,
  },
  input: {
    background: 'var(--surface2)',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '9px 12px',
    color: 'var(--text)',
    fontSize: 14,
    width: '100%',
  },
  select: {
    background: 'var(--surface2)',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '9px 12px',
    color: 'var(--text)',
    fontSize: 14,
    width: '100%',
    cursor: 'pointer',
  },
  row: {
    display: 'flex',
    gap: 12,
  },
  segmented: {
    display: 'flex',
    background: 'var(--surface2)',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    overflow: 'hidden',
    padding: 3,
    gap: 3,
  },
  segment: {
    flex: 1,
    padding: '7px 12px',
    fontSize: 13,
    fontWeight: 500,
    background: 'transparent',
    color: 'var(--text-muted)',
    borderRadius: 6,
  },
  segmentActive: {
    background: 'var(--accent-dim)',
    color: 'var(--accent-light)',
  },
  checkList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  checkRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  checkLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer',
    flex: 1,
    fontSize: 14,
  },
  shareHint: {
    fontSize: 12,
    color: 'var(--text-muted)',
    fontVariantNumeric: 'tabular-nums',
  },
  customTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 13,
    color: 'var(--text-muted)',
    marginTop: 4,
    padding: '8px 0 0',
    borderTop: '1px solid var(--border)',
  },
  formActions: {
    display: 'flex',
    gap: 10,
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    background: 'var(--surface2)',
    color: 'var(--text-muted)',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 18px',
    fontSize: 14,
    fontWeight: 500,
    border: '1px solid var(--border)',
  },
  submitBtn: {
    background: 'var(--accent)',
    color: '#fff',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 22px',
    fontSize: 14,
    fontWeight: 600,
  },
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
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  cardTop: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  catIcon: { fontSize: 22, flexShrink: 0 },
  cardInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  },
  cardTitle: { fontSize: 15, fontWeight: 600, color: 'var(--text)' },
  cardMeta: { fontSize: 12, color: 'var(--text-muted)' },
  cardRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 2,
  },
  cardAmount: {
    fontSize: 18,
    fontWeight: 700,
    color: 'var(--text)',
    fontVariantNumeric: 'tabular-nums',
  },
  cardPer: { fontSize: 11, color: 'var(--text-muted)' },
  removeBtn: {
    background: 'transparent',
    color: 'var(--text-dim)',
    fontSize: 13,
    padding: '4px 6px',
    borderRadius: 6,
    flexShrink: 0,
  },
  cardParticipants: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 10,
    borderTop: '1px solid var(--border)',
  },
  participant: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    background: 'var(--surface2)',
    borderRadius: 99,
    padding: '3px 10px 3px 4px',
  },
  participantName: { fontSize: 12, color: 'var(--text-muted)' },
}
