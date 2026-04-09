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

export default function ExpensePanel({ people, expenses, personById, onAdd, onRemove }) {
  const [showForm, setShowForm] = useState(false)

  if (people.length < 2 && !showForm) {
    return (
      <div style={styles.panel}>
        <SectionHeader title="Expenses" subtitle="Track what was spent and by whom" />
        <EmptyState icon="👥" message="Add at least 2 people before logging expenses." />
      </div>
    )
  }

  const totalSpend = expenses.reduce((s, e) => s + e.amount, 0)

  return (
    <div style={styles.panel}>
      <div style={styles.headerRow}>
        <SectionHeader
          title="Expenses"
          subtitle={
            expenses.length > 0
              ? `${expenses.length} expense${expenses.length !== 1 ? 's' : ''} · $${totalSpend.toFixed(2)} total`
              : 'No expenses yet'
          }
        />
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
                  <div style={styles.catIconWrap}>{getCategoryIcon(exp.category)}</div>
                  <div style={styles.cardInfo}>
                    <span style={styles.cardTitle}>{exp.description}</span>
                    <span style={styles.cardMeta}>
                      Paid by <strong style={{ color: 'var(--text)' }}>{payer?.name ?? '?'}</strong>
                      <span style={styles.dot}>·</span>
                      split {exp.splitAmong.length} ways
                    </span>
                  </div>
                  <div style={styles.cardRight}>
                    <span style={styles.cardAmount}>${exp.amount.toFixed(2)}</span>
                    <span style={styles.cardPer}>${perPerson.toFixed(2)}/person</span>
                  </div>
                  <button style={styles.removeBtn} onClick={() => onRemove(exp.id)} title="Delete">✕</button>
                </div>
                <div style={styles.cardParticipants}>
                  {exp.splitAmong.map((pid) => (
                    <div key={pid} style={styles.participant}>
                      <Avatar name={personById[pid]?.name ?? '?'} size={20} />
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
  const customOk = splitMode !== 'custom' || Math.abs(totalCustom - amountNum) < 0.01

  const canSubmit = desc.trim() && amountNum > 0 && splitAmong.length > 0 && customOk

  function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    onAdd({ description: desc.trim(), amount: amountNum, paidBy, category, splitAmong })
  }

  return (
    <div style={styles.formCard}>
      <div style={styles.formHeader}>
        <span style={styles.formTitle}>New Expense</span>
        <button style={styles.formClose} onClick={onCancel}>✕</button>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <Field label="Description">
          <InputBase
            placeholder="e.g. Dinner at Pizzeria"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            autoFocus
          />
        </Field>

        <div style={styles.row}>
          <Field label="Amount ($)" style={{ flex: 1 }}>
            <InputBase
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Field>
          <Field label="Category" style={{ flex: 1 }}>
            <SelectBase value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
              ))}
            </SelectBase>
          </Field>
        </div>

        <Field label="Paid by">
          <SelectBase value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
            {people.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </SelectBase>
        </Field>

        <Field label="Split method">
          <div style={styles.segmented}>
            {['equal', 'custom'].map((m) => (
              <button
                key={m}
                type="button"
                style={{ ...styles.segment, ...(splitMode === m ? styles.segmentActive : {}) }}
                onClick={() => setSplitMode(m)}
              >
                {m === 'equal' ? '⚖️ Split equally' : '✏️ Custom split'}
              </button>
            ))}
          </div>
        </Field>

        <Field label={splitMode === 'equal' ? 'Split among' : 'Custom amounts'}>
          <div style={styles.checkList}>
            {people.map((p) => {
              const checked = splitAmong.includes(p.id)
              return (
                <div key={p.id} style={styles.checkRow}>
                  <label style={styles.checkLabel}>
                    <input type="checkbox" checked={checked} onChange={() => togglePerson(p.id)} />
                    <Avatar name={p.name} size={26} />
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{p.name}</span>
                  </label>
                  {splitMode === 'equal' && checked && amountNum > 0 && (
                    <span style={styles.shareHint}>
                      ${(amountNum / splitAmong.length).toFixed(2)}
                    </span>
                  )}
                  {splitMode === 'custom' && (
                    <input
                      style={{ ...styles.miniInput }}
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
              <span style={{ color: 'var(--text-muted)' }}>Assigned</span>
              <span style={{
                fontWeight: 700,
                color: Math.abs(totalCustom - amountNum) < 0.01 ? 'var(--green)' : 'var(--red)',
              }}>
                ${totalCustom.toFixed(2)} / ${amountNum.toFixed(2)}
              </span>
            </div>
          )}
        </Field>

        <div style={styles.formActions}>
          <button type="button" style={styles.cancelBtn} onClick={onCancel}>Cancel</button>
          <button type="submit" style={{ ...styles.submitBtn, ...(canSubmit ? {} : styles.submitBtnDisabled) }} disabled={!canSubmit}>
            Add Expense
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, children, style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, ...style }}>
      <label style={fieldLabelStyle}>{label}</label>
      {children}
    </div>
  )
}

const fieldLabelStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.6px',
}

function InputBase({ ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      {...props}
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: `1.5px solid ${focused ? 'rgba(108,99,255,0.5)' : 'rgba(255,255,255,0.08)'}`,
        boxShadow: focused ? '0 0 0 3px rgba(108,99,255,0.1)' : 'none',
        borderRadius: 'var(--radius-sm)',
        padding: '10px 13px',
        color: 'var(--text)',
        fontSize: 14,
        width: '100%',
        transition: 'all 0.18s ease',
        ...props.style,
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  )
}

function SelectBase({ children, ...props }) {
  return (
    <select
      {...props}
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1.5px solid rgba(255,255,255,0.08)',
        borderRadius: 'var(--radius-sm)',
        padding: '10px 13px',
        color: 'var(--text)',
        fontSize: 14,
        width: '100%',
        cursor: 'pointer',
        appearance: 'auto',
      }}
    >
      {children}
    </select>
  )
}

const styles = {
  panel: { display: 'flex', flexDirection: 'column' },
  headerRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  newBtn: {
    background: 'linear-gradient(135deg, #6c63ff, #a78bfa)',
    color: '#fff',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 18px',
    fontSize: 13,
    fontWeight: 600,
    marginTop: 4,
    flexShrink: 0,
    boxShadow: '0 4px 12px rgba(108,99,255,0.3)',
  },
  formCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(108,99,255,0.2)',
    borderRadius: 'var(--radius)',
    padding: 22,
    marginBottom: 24,
    boxShadow: '0 0 0 1px rgba(108,99,255,0.05), 0 8px 32px rgba(0,0,0,0.3)',
  },
  formHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--text)',
  },
  formClose: {
    background: 'rgba(255,255,255,0.06)',
    color: 'var(--text-muted)',
    borderRadius: 7,
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    border: '1px solid rgba(255,255,255,0.08)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  row: { display: 'flex', gap: 12 },
  segmented: {
    display: 'flex',
    background: 'rgba(255,255,255,0.04)',
    border: '1.5px solid rgba(255,255,255,0.08)',
    borderRadius: 'var(--radius-sm)',
    padding: 3,
    gap: 3,
  },
  segment: {
    flex: 1,
    padding: '8px 10px',
    fontSize: 13,
    fontWeight: 500,
    background: 'transparent',
    color: 'var(--text-muted)',
    borderRadius: 7,
  },
  segmentActive: {
    background: 'rgba(108,99,255,0.15)',
    color: '#c4b5fd',
    boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
  },
  checkList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  checkRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 9,
    cursor: 'pointer',
    flex: 1,
  },
  shareHint: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--accent-light)',
    fontVariantNumeric: 'tabular-nums',
  },
  miniInput: {
    background: 'rgba(255,255,255,0.05)',
    border: '1.5px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: '6px 10px',
    color: 'var(--text)',
    fontSize: 13,
    width: 90,
    textAlign: 'right',
  },
  customTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 13,
    marginTop: 8,
    padding: '10px 0 0',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },
  formActions: {
    display: 'flex',
    gap: 10,
    justifyContent: 'flex-end',
    paddingTop: 4,
  },
  cancelBtn: {
    background: 'rgba(255,255,255,0.05)',
    color: 'var(--text-muted)',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 18px',
    fontSize: 14,
    fontWeight: 500,
    border: '1px solid rgba(255,255,255,0.08)',
  },
  submitBtn: {
    background: 'linear-gradient(135deg, #6c63ff, #a78bfa)',
    color: '#fff',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 24px',
    fontSize: 14,
    fontWeight: 600,
    boxShadow: '0 4px 12px rgba(108,99,255,0.3)',
  },
  submitBtnDisabled: {
    opacity: 0.4,
    boxShadow: 'none',
  },
  list: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    marginTop: 8,
  },
  card: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 'var(--radius)',
    padding: '15px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    transition: 'border-color 0.18s',
  },
  cardTop: {
    display: 'flex',
    alignItems: 'center',
    gap: 13,
  },
  catIconWrap: {
    fontSize: 22,
    width: 42,
    height: 42,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    minWidth: 0,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: 'var(--text)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  cardMeta: { fontSize: 12, color: 'var(--text-muted)' },
  dot: { margin: '0 6px', opacity: 0.4 },
  cardRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 3,
    flexShrink: 0,
  },
  cardAmount: {
    fontSize: 18,
    fontWeight: 700,
    color: 'var(--text)',
    fontVariantNumeric: 'tabular-nums',
  },
  cardPer: {
    fontSize: 11,
    color: 'var(--text-muted)',
    fontVariantNumeric: 'tabular-nums',
  },
  removeBtn: {
    background: 'transparent',
    color: 'var(--text-dim)',
    fontSize: 12,
    padding: '5px 6px',
    borderRadius: 7,
    flexShrink: 0,
  },
  cardParticipants: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 7,
    paddingTop: 10,
    borderTop: '1px solid rgba(255,255,255,0.05)',
  },
  participant: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 99,
    padding: '3px 10px 3px 5px',
  },
  participantName: {
    fontSize: 12,
    color: 'var(--text-muted)',
    fontWeight: 500,
  },
}
