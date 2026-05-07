import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Plus, Search, Clock, ChevronDown, ChevronUp, Pill, AlertCircle } from 'lucide-react'
import { searchDrugs, getDrugInfo } from '../utils/api'
import clsx from 'clsx'

const ACB_STYLE = {
  0: null,
  1: { bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.3)',  text: '#60a5fa', label: 'ACB 1 — Mild' },
  2: { bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.3)',  text: '#fbbf24', label: 'ACB 2 — Moderate' },
  3: { bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)',   text: '#f87171', label: 'ACB 3 — High' },
}

const FREQUENCIES = [
  { value: 'once',   label: 'Once daily',    times: 1 },
  { value: 'twice',  label: 'Twice daily',   times: 2 },
  { value: 'three',  label: 'Three times daily', times: 3 },
  { value: 'four',   label: 'Four times daily',  times: 4 },
  { value: 'weekly', label: 'Once weekly',   times: 1 },
  { value: 'prn',    label: 'As needed (PRN)', times: 1 },
  { value: 'custom', label: 'Custom',        times: null },
]

const DEFAULT_TIMES = {
  once:   ['08:00'],
  twice:  ['08:00', '20:00'],
  three:  ['08:00', '14:00', '22:00'],
  four:   ['08:00', '12:00', '16:00', '22:00'],
  weekly: ['08:00'],
  prn:    [],
  custom: [],
}

const FOOD_OPTIONS = [
  { value: 'any',    label: 'Any time',   icon: '🔄' },
  { value: 'before', label: 'Before food', icon: '🍽️' },
  { value: 'with',   label: 'With food',  icon: '🥗' },
  { value: 'after',  label: 'After food', icon: '✅' },
]

const COMMON_INDICATIONS = [
  'High Blood Pressure', 'Type 2 Diabetes', 'High Cholesterol', 'Heart Failure',
  'Atrial Fibrillation', 'Depression', 'Anxiety', 'Pain', 'Arthritis',
  'Acid Reflux', 'Asthma', 'COPD', 'Epilepsy', 'Parkinson\'s Disease',
  'Hypothyroidism', 'Osteoporosis', 'Insomnia', 'Bipolar Disorder',
  'Schizophrenia', 'Blood Clot', 'Angina', 'Migraine', 'Infection',
]

function MedicationCard({ med, index, onChange, onRemove, showFullMode }) {
  const [expanded, setExpanded] = useState(showFullMode)
  const [drugInfo, setDrugInfo] = useState(null)
  const [showIndications, setShowIndications] = useState(false)

  useEffect(() => {
    if (!med.drug_name) return
    getDrugInfo(med.drug_name).then(setDrugInfo).catch(() => {})
  }, [med.drug_name])

  const updateField = (field, value) => onChange(index, { ...med, [field]: value })

  const setFrequency = (freq) => {
    const times = DEFAULT_TIMES[freq] || []
    onChange(index, { ...med, frequency: freq, times: [...times] })
  }

  const updateTime = (tIdx, value) => {
    const newTimes = [...med.times]
    newTimes[tIdx] = value
    onChange(index, { ...med, times: newTimes })
  }

  const addTime = () => {
    onChange(index, { ...med, times: [...med.times, '08:00'] })
  }

  const removeTime = (tIdx) => {
    onChange(index, { ...med, times: med.times.filter((_, i) => i !== tIdx) })
  }

  const acb = drugInfo?.acb_score || 0
  const acbStyle = ACB_STYLE[acb]
  const hasMealRule = drugInfo?.meal_rule
  const isNarrowTI  = drugInfo?.narrow_ti

  return (
    <div className="rounded-2xl border overflow-hidden transition-all duration-200"
      style={{ borderColor: acbStyle?.border || 'var(--border)', background: 'var(--bg-card)' }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: acbStyle?.bg || 'var(--bg-elevated)', border: `1px solid ${acbStyle?.border || 'var(--border)'}` }}>
          <Pill size={14} style={{ color: acbStyle?.text || 'var(--text-muted)' }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display font-semibold text-sm capitalize" style={{ color: 'var(--text-primary)' }}>
              {med.drug_name}
            </span>
            {acbStyle && (
              <span className="text-xs px-2 py-0.5 rounded font-mono"
                style={{ background: acbStyle.bg, color: acbStyle.text, border: `1px solid ${acbStyle.border}` }}>
                {acbStyle.label}
              </span>
            )}
            {isNarrowTI && (
              <span className="text-xs px-2 py-0.5 rounded font-mono"
                style={{ background: 'rgba(168,85,247,0.1)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)' }}>
                Narrow TI
              </span>
            )}
            {hasMealRule && (
              <span className="text-xs px-2 py-0.5 rounded font-mono"
                style={{ background: 'rgba(6,182,212,0.1)', color: '#22d3ee', border: '1px solid rgba(6,182,212,0.3)' }}>
                Food timing rule
              </span>
            )}
          </div>
          {med.indication && (
            <p className="text-xs text-[var(--text-muted)] mt-0.5">For: {med.indication}</p>
          )}
          {med.times.length > 0 && (
            <p className="text-xs text-[var(--text-muted)]">
              🕐 {med.times.join(' · ')}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {showFullMode && (
            <button type="button" onClick={() => setExpanded(e => !e)}
              className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              style={{ color: 'var(--text-muted)' }}>
              {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
          )}
          <button type="button" onClick={() => onRemove(index)}
            className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
            style={{ color: 'var(--text-muted)' }}>
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Meal rule hint */}
      {hasMealRule && expanded && (
        <div className="mx-4 mb-3 px-3 py-2 rounded-xl text-xs leading-relaxed"
          style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.2)', color: '#67e8f9' }}>
          <strong>Food timing rule:</strong> {hasMealRule.reason}
        </div>
      )}

      {/* Expanded detail */}
      {expanded && showFullMode && (
        <div className="px-4 pb-4 space-y-4 border-t border-[var(--border)] pt-4">

          {/* Dose */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Dose</label>
              <input type="text" value={med.dose || ''} onChange={e => updateField('dose', e.target.value)}
                placeholder="e.g. 500mg" className="input-field text-sm" />
            </div>

            {/* Indication */}
            <div className="space-y-1.5 relative">
              <label className="text-xs font-medium text-[var(--text-secondary)]">What is this for?</label>
              <input type="text" value={med.indication || ''}
                onChange={e => updateField('indication', e.target.value)}
                onFocus={() => setShowIndications(true)}
                onBlur={() => setTimeout(() => setShowIndications(false), 200)}
                placeholder="e.g. High Blood Pressure" className="input-field text-sm" />
              {showIndications && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-[var(--border)] shadow-2xl z-50 max-h-48 overflow-y-auto"
                  style={{ background: 'var(--bg-card)' }}>
                  {COMMON_INDICATIONS
                    .filter(i => !med.indication || i.toLowerCase().includes(med.indication.toLowerCase()))
                    .map(ind => (
                      <button key={ind} type="button"
                        onMouseDown={() => updateField('indication', ind)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-white/5 transition-colors"
                        style={{ color: 'var(--text-primary)' }}>
                        {ind}
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Frequency */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-secondary)]">Frequency</label>
            <div className="flex flex-wrap gap-2">
              {FREQUENCIES.map(({ value, label }) => (
                <button key={value} type="button"
                  onClick={() => setFrequency(value)}
                  className="text-xs px-3 py-1.5 rounded-lg border transition-all duration-150"
                  style={med.frequency === value
                    ? { background: 'var(--brand-glow)', borderColor: 'var(--brand)', color: 'var(--brand)' }
                    : { background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }
                  }>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Times */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[var(--text-secondary)] flex items-center gap-1.5">
                <Clock size={12} /> Dose Times
              </label>
              <button type="button" onClick={addTime}
                className="text-xs flex items-center gap-1 px-2 py-1 rounded-lg transition-colors"
                style={{ color: 'var(--brand)', background: 'var(--brand-glow)' }}>
                <Plus size={11} /> Add time
              </button>
            </div>
            {med.times.length === 0 && (
              <p className="text-xs text-[var(--text-muted)]">No times set — select a frequency above or add times manually.</p>
            )}
            <div className="flex flex-wrap gap-2">
              {med.times.map((t, ti) => (
                <div key={ti} className="flex items-center gap-1.5 px-2 py-1 rounded-lg border"
                  style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
                  <Clock size={11} style={{ color: 'var(--brand)' }} />
                  <input
                    type="time"
                    value={t}
                    onChange={e => updateTime(ti, e.target.value)}
                    className="bg-transparent text-xs outline-none font-mono"
                    style={{ color: 'var(--text-primary)', colorScheme: 'dark', width: '80px' }}
                  />
                  <button type="button" onClick={() => removeTime(ti)}
                    className="hover:opacity-70 transition-opacity"
                    style={{ color: 'var(--text-muted)' }}>
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Food relation */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-secondary)]">Take with food?</label>
            <div className="flex gap-2 flex-wrap">
              {FOOD_OPTIONS.map(({ value, label, icon }) => (
                <button key={value} type="button"
                  onClick={() => updateField('food_relation', value)}
                  className="text-xs px-3 py-1.5 rounded-lg border transition-all duration-150 flex items-center gap-1.5"
                  style={med.food_relation === value
                    ? { background: 'var(--brand-glow)', borderColor: 'var(--brand)', color: 'var(--brand)' }
                    : { background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }
                  }>
                  <span>{icon}</span> {label}
                </button>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  )
}


export default function MedicationScheduleBuilder({ medications, onChange, showFullMode = false }) {
  const [query, setQuery]           = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading]       = useState(false)
  const inputRef = useRef(null)
  const dropRef  = useRef(null)

  useEffect(() => {
    if (!query.trim()) { setSuggestions([]); return }
    const id = setTimeout(async () => {
      setLoading(true)
      try {
        const currentNames = medications.map(m => m.drug_name.toLowerCase())
        const res = await searchDrugs(query.trim())
        setSuggestions(res.filter(d => !currentNames.includes(d)))
      } catch { setSuggestions([]) }
      finally { setLoading(false) }
    }, 250)
    return () => clearTimeout(id)
  }, [query, medications])

  useEffect(() => {
    const handler = (e) => {
      if (!dropRef.current?.contains(e.target) && e.target !== inputRef.current)
        setSuggestions([])
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const addMedication = (name) => {
    const clean = name.toLowerCase().trim()
    if (!clean || medications.some(m => m.drug_name === clean)) return
    const newMed = {
      drug_name:     clean,
      dose:          '',
      indication:    '',
      frequency:     showFullMode ? 'once' : '',
      times:         showFullMode ? ['08:00'] : [],
      food_relation: 'any',
      route:         'oral',
    }
    onChange([...medications, newMed])
    setQuery('')
    setSuggestions([])
    inputRef.current?.focus()
  }

  const updateMedication = (index, updated) => {
    onChange(medications.map((m, i) => i === index ? updated : m))
  }

  const removeMedication = (index) => {
    onChange(medications.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      {/* Search input */}
      <div className="relative">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200"
          style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
          <Search size={15} style={{ color: 'var(--text-muted)' }} />
          <input ref={inputRef} type="text" value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (query.trim()) addMedication(query.trim()) }}}
            placeholder="Search or type any medication name…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--text-muted)]"
            style={{ color: 'var(--text-primary)' }} autoComplete="off" />
          {query && (
            <button type="button" onClick={() => addMedication(query)}
              className="shrink-0 flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg"
              style={{ color: 'var(--brand)', background: 'var(--brand-glow)' }}>
              <Plus size={12} /> Add
            </button>
          )}
        </div>

        {suggestions.length > 0 && (
          <div ref={dropRef} className="absolute top-full left-0 right-0 mt-1.5 rounded-xl border shadow-2xl z-50 overflow-hidden"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            {suggestions.slice(0, 10).map(drug => (
              <button key={drug} type="button"
                onMouseDown={() => addMedication(drug)}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors text-left">
                <Pill size={13} style={{ color: 'var(--text-muted)' }} />
                <span className="capitalize" style={{ color: 'var(--text-primary)' }}>{drug}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Count badge */}
      {medications.length > 0 && (
        <div className="flex items-center justify-between text-xs">
          <span style={{ color: 'var(--text-muted)' }}>
            {medications.length} medication{medications.length !== 1 ? 's' : ''} added
            {medications.length >= 5 && <span style={{ color: '#f59e0b' }}> · Polypharmacy threshold reached</span>}
          </span>
          {showFullMode && (
            <span style={{ color: 'var(--text-muted)' }}>Click any card to expand details</span>
          )}
        </div>
      )}

      {/* Medication cards */}
      <div className="space-y-2">
        {medications.map((med, i) => (
          <MedicationCard key={`${med.drug_name}-${i}`}
            med={med} index={i}
            onChange={updateMedication}
            onRemove={removeMedication}
            showFullMode={showFullMode}
          />
        ))}
      </div>

      {medications.length === 0 && (
        <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>
          Start typing above to search for medications, or press Enter to add any drug name.
        </p>
      )}
    </div>
  )
}
