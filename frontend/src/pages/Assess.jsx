import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Zap, ClipboardList, User, Weight, ChevronRight,
  AlertCircle, Loader2, Coffee, Info
} from 'lucide-react'
import MealTimeInput from '../components/MealTimeInput'
import MedicationScheduleBuilder from '../components/MedicationScheduleBuilder'
import DailyTimeline from '../components/DailyTimeline'
import { assessQuick, assessFull } from '../utils/api'
import clsx from 'clsx'

const MODES = [
  {
    id: 'quick',
    icon: Zap,
    label: 'Quick Check',
    time: '~2 minutes',
    desc: 'Drug names only. Checks interactions, ACB burden, and polypharmacy risk.',
    colour: 'brand',
  },
  {
    id: 'full',
    icon: ClipboardList,
    label: 'Full Assessment',
    time: '~5 minutes',
    desc: 'Add dose times, meal schedule, and indications for complete timing-aware analysis.',
    colour: 'blue',
  },
]

export default function Assess() {
  const navigate = useNavigate()
  const [mode, setMode]   = useState('quick')
  const [step, setStep]   = useState(1) // 1=profile, 2=meals(full only), 3=meds, 4=review(full)
  const [loading, setLoading]   = useState(false)
  const [error,   setError]     = useState('')

  const [profile, setProfile] = useState({ age: '', sex: 'male', weight: '' })
  const [meals, setMeals]     = useState({ breakfast: null, lunch: null, dinner: null })
  const [medications, setMeds] = useState([])

  const setP = (k) => (e) => setProfile(p => ({ ...p, [k]: e.target.value }))

  const totalSteps = mode === 'full' ? 4 : 3

  const validateStep = () => {
    if (step === 1) {
      if (!profile.age || isNaN(profile.age) || +profile.age < 18 || +profile.age > 110)
        return 'Please enter a valid age (18–110).'
      if (!profile.weight || isNaN(profile.weight) || +profile.weight < 20 || +profile.weight > 300)
        return 'Please enter a valid weight (20–300 kg).'
      return ''
    }
    if (step === (mode === 'full' ? 3 : 2)) {
      if (medications.length === 0) return 'Please add at least one medication.'
    }
    return ''
  }

  const nextStep = () => {
    const err = validateStep()
    if (err) { setError(err); return }
    setError('')
    setStep(s => s + 1)
  }

  const handleSubmit = async () => {
    const err = validateStep()
    if (err) { setError(err); return }
    setError('')
    setLoading(true)
    try {
      let result
      if (mode === 'quick') {
        result = await assessQuick({
          age: +profile.age, sex: profile.sex, weight: +profile.weight,
          drugs: medications.map(m => m.drug_name),
        })
      } else {
        result = await assessFull({
          patient: {
            age: +profile.age, sex: profile.sex, weight: +profile.weight,
            renal_impairment: profile.renal || 'none',
            hepatic_impairment: profile.hepatic || 'none',
          },
          meals,
          medications: medications.map(m => ({
            ...m,
            times: m.times || [],
          })),
        })
      }
      navigate('/results', { state: { result, mode, profile, meals, medications } })
    } catch (e) {
      setError(e.message || 'Assessment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Step numbers for full mode: 1=Profile, 2=Meals, 3=Medications, 4=Review
  // Step numbers for quick mode: 1=Profile, 2=Medications, 3=Review
  const getStepLabel = (s) => {
    if (mode === 'quick') return ['', 'Profile', 'Medications', 'Review'][s]
    return ['', 'Profile', 'Meal Times', 'Medications', 'Review'][s]
  }

  const isLastStep = step === totalSteps
  const medStep    = mode === 'full' ? 3 : 2
  const reviewStep = mode === 'full' ? 4 : 3

  return (
    <div className="max-w-2xl mx-auto px-6 py-14 space-y-8">

      {/* Header */}
      <div className="space-y-2 animate-fade-up">
        <h1 className="font-display font-bold text-4xl">Risk Assessment</h1>
        <p className="text-[var(--text-secondary)]">
          Choose your assessment type and follow the steps below.
        </p>
      </div>

      {/* Mode selector */}
      {step === 1 && (
        <div className="grid sm:grid-cols-2 gap-4 animate-fade-up">
          {MODES.map(({ id, icon: Icon, label, time, desc, colour }) => (
            <button key={id} type="button" onClick={() => setMode(id)}
              className={clsx(
                'text-left p-5 rounded-2xl border transition-all duration-200 space-y-3',
                mode === id
                  ? 'border-brand-500 ring-2 ring-brand-500/20'
                  : 'border-[var(--border)] hover:border-[var(--border-hover)]'
              )}
              style={{ background: mode === id ? 'var(--brand-glow)' : 'var(--bg-card)' }}>
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: mode === id ? 'rgba(23,179,116,0.2)' : 'var(--bg-elevated)' }}>
                  <Icon size={18} style={{ color: mode === id ? 'var(--brand)' : 'var(--text-muted)' }} />
                </div>
                {mode === id && (
                  <div className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                )}
              </div>
              <div>
                <div className="font-display font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {label}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--brand)' }}>{time}</div>
                <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Progress bar */}
      <div className="space-y-2 animate-fade-up">
        <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
          <span>Step {step} of {totalSteps}: {getStepLabel(step)}</span>
          <span>{Math.round((step / totalSteps) * 100)}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${(step / totalSteps) * 100}%`, background: 'linear-gradient(90deg, var(--brand), #3bce8d)' }} />
        </div>
      </div>

      {/* ── STEP 1: Patient Profile ── */}
      {step === 1 && (
        <div className="card space-y-5 animate-fade-up">
          <div className="flex items-center gap-2 font-display font-semibold text-sm"
            style={{ color: 'var(--brand)' }}>
            <User size={15} /> Patient Profile
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Age (years)</label>
              <input type="number" min="18" max="110" value={profile.age}
                onChange={setP('age')} placeholder="e.g. 68" className="input-field" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Biological Sex</label>
              <select value={profile.sex} onChange={setP('sex')} className="input-field">
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Weight (kg)</label>
              <input type="number" min="20" max="300" value={profile.weight}
                onChange={setP('weight')} placeholder="e.g. 72" className="input-field" />
            </div>
          </div>

          {mode === 'full' && (
            <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-[var(--border)]">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--text-secondary)]">
                  Kidney Function
                </label>
                <select value={profile.renal || 'none'} onChange={setP('renal')} className="input-field">
                  <option value="none">Normal</option>
                  <option value="mild">Mild Impairment</option>
                  <option value="moderate">Moderate Impairment</option>
                  <option value="severe">Severe Impairment</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--text-secondary)]">
                  Liver Function
                </label>
                <select value={profile.hepatic || 'none'} onChange={setP('hepatic')} className="input-field">
                  <option value="none">Normal</option>
                  <option value="mild">Mild Impairment</option>
                  <option value="severe">Severe Impairment</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 2 (full only): Meal Times ── */}
      {step === 2 && mode === 'full' && (
        <div className="card space-y-4 animate-fade-up">
          <div className="flex items-center gap-2 font-display font-semibold text-sm"
            style={{ color: 'var(--brand)' }}>
            <Coffee size={15} /> Meal Times
          </div>
          <MealTimeInput meals={meals} onChange={setMeals} />
        </div>
      )}

      {/* ── STEP 2/3: Medications ── */}
      {step === medStep && (
        <div className="card space-y-4 animate-fade-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-display font-semibold text-sm"
              style={{ color: 'var(--brand)' }}>
              💊 Medications
            </div>
            {mode === 'full' && (
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Click each card to add dose times &amp; details
              </span>
            )}
          </div>
          <MedicationScheduleBuilder
            medications={medications}
            onChange={setMeds}
            showFullMode={mode === 'full'}
          />
        </div>
      )}

      {/* ── STEP 3/4: Review ── */}
      {step === reviewStep && (
        <div className="space-y-4 animate-fade-up">
          {/* Summary card */}
          <div className="card space-y-4">
            <h2 className="font-display font-semibold text-base">Review Your Assessment</h2>

            <div className="grid grid-cols-3 gap-3 text-sm">
              {[
                { label: 'Age',         value: `${profile.age} yrs` },
                { label: 'Sex',         value: profile.sex },
                { label: 'Weight',      value: `${profile.weight} kg` },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl p-3 text-center" style={{ background: 'var(--bg-elevated)' }}>
                  <div className="font-display font-bold text-base capitalize">{value}</div>
                  <div className="text-xs text-[var(--text-muted)]">{label}</div>
                </div>
              ))}
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                {medications.length} medication{medications.length !== 1 ? 's' : ''}
                {medications.length >= 5 ? ' · ⚠️ Polypharmacy threshold' : ''}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {medications.map(m => (
                  <span key={m.drug_name} className="text-xs px-2 py-0.5 rounded capitalize border"
                    style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                    {m.drug_name}
                    {m.times?.length > 0 && (
                      <span style={{ color: 'var(--text-muted)' }}> · {m.times.join(', ')}</span>
                    )}
                  </span>
                ))}
              </div>
            </div>

            {mode === 'full' && (
              <DailyTimeline medications={medications} meals={meals} />
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl border text-sm animate-fade-in"
          style={{ background: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.2)', color: '#f87171' }}>
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex gap-3">
        {step > 1 && (
          <button type="button" onClick={() => setStep(s => s - 1)}
            className="px-6 py-3 rounded-xl text-sm font-medium border border-[var(--border)] hover:border-[var(--border-hover)] transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            Back
          </button>
        )}

        {!isLastStep ? (
          <button type="button" onClick={nextStep}
            className="btn-primary flex-1 flex items-center justify-center gap-2">
            Continue <ChevronRight size={16} />
          </button>
        ) : (
          <button type="button" onClick={handleSubmit} disabled={loading}
            className="btn-primary flex-1 flex items-center justify-center gap-2 py-4">
            {loading
              ? <><Loader2 size={18} className="animate-spin" /> Analysing…</>
              : <>{mode === 'full' ? '🧠 Run Full Assessment' : '⚡ Quick Check'} <ChevronRight size={16} /></>
            }
          </button>
        )}
      </div>

      <p className="text-center text-xs text-[var(--text-muted)]">
        ⚠️ For informational and research purposes only. Not medical advice. No data is stored.
      </p>
    </div>
  )
}
