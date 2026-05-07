import { Coffee, Sun, Moon } from 'lucide-react'
import clsx from 'clsx'

const MEALS = [
  { key: 'breakfast', label: 'Breakfast', icon: Coffee, placeholder: '07:30', hint: 'Morning meal' },
  { key: 'lunch',     label: 'Lunch',     icon: Sun,    placeholder: '12:30', hint: 'Midday meal' },
  { key: 'dinner',    label: 'Dinner',    icon: Moon,   placeholder: '18:30', hint: 'Evening meal' },
]

export default function MealTimeInput({ meals, onChange }) {
  const set = (key) => (e) => onChange({ ...meals, [key]: e.target.value || null })

  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
        Meal times help PolyGuard check whether your medications are taken at the right time relative to food.
        Some drugs must be taken before, with, or after meals to work properly or avoid side effects.
      </p>
      <div className="grid grid-cols-3 gap-3">
        {MEALS.map(({ key, label, icon: Icon, placeholder, hint }) => (
          <div key={key} className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
              <Icon size={12} />
              {label}
            </label>
            <input
              type="time"
              value={meals[key] || ''}
              onChange={set(key)}
              className="input-field text-sm"
              style={{ colorScheme: 'dark' }}
            />
            <p className="text-xs text-[var(--text-muted)]">{hint}</p>
          </div>
        ))}
      </div>
      {Object.values(meals).every(v => !v) && (
        <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg"
          style={{ background: 'rgba(245,158,11,0.08)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)' }}>
          ℹ️ Meal times are optional but enable food-drug timing checks
        </div>
      )}
    </div>
  )
}
