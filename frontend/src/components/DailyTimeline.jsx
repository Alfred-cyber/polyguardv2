import { useMemo } from 'react'
import clsx from 'clsx'

const HOUR_LABELS = ['12am','2am','4am','6am','8am','10am','12pm','2pm','4pm','6pm','8pm','10pm']
const WINDOW_COLOURS = {
  Night:       { bg: 'rgba(99,102,241,0.15)',  border: 'rgba(99,102,241,0.3)',  text: '#a5b4fc' },
  Morning:     { bg: 'rgba(251,191,36,0.15)',  border: 'rgba(251,191,36,0.3)',  text: '#fcd34d' },
  'Mid-Morning':{ bg: 'rgba(6,182,212,0.12)',  border: 'rgba(6,182,212,0.3)',   text: '#67e8f9' },
  Lunchtime:   { bg: 'rgba(16,185,129,0.15)',  border: 'rgba(16,185,129,0.3)',  text: '#6ee7b7' },
  Afternoon:   { bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)',  text: '#fbbf24' },
  Evening:     { bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)',   text: '#fca5a5' },
  Bedtime:     { bg: 'rgba(168,85,247,0.15)',  border: 'rgba(168,85,247,0.3)',  text: '#d8b4fe' },
}

const DRUG_COLOURS = [
  '#17b374','#3b82f6','#f59e0b','#ef4444','#8b5cf6',
  '#ec4899','#06b6d4','#84cc16','#f97316','#14b8a6',
]

function timeToPercent(timeStr) {
  const [h, m] = timeStr.split(':').map(Number)
  return ((h * 60 + m) / 1440) * 100
}

function getWindow(hour) {
  if (hour < 6)  return 'Night'
  if (hour < 10) return 'Morning'
  if (hour < 12) return 'Mid-Morning'
  if (hour < 14) return 'Lunchtime'
  if (hour < 18) return 'Afternoon'
  if (hour < 21) return 'Evening'
  return 'Bedtime'
}

export default function DailyTimeline({ medications, meals }) {
  const drugColourMap = useMemo(() => {
    const map = {}
    medications.forEach((m, i) => {
      map[m.drug_name] = DRUG_COLOURS[i % DRUG_COLOURS.length]
    })
    return map
  }, [medications])

  const allDoses = useMemo(() => {
    const doses = []
    medications.forEach(med => {
      (med.times || []).forEach(t => {
        const [h, m] = t.split(':').map(Number)
        doses.push({
          drug: med.drug_name,
          time: t,
          hour: h,
          minute: m,
          pct: timeToPercent(t),
          window: getWindow(h),
          colour: drugColourMap[med.drug_name],
          indication: med.indication || '',
        })
      })
    })
    return doses.sort((a, b) => a.pct - b.pct)
  }, [medications, drugColourMap])

  const mealMarkers = useMemo(() => {
    const markers = []
    if (meals?.breakfast) markers.push({ label: '🍳', time: meals.breakfast, pct: timeToPercent(meals.breakfast) })
    if (meals?.lunch)     markers.push({ label: '🥗', time: meals.lunch,     pct: timeToPercent(meals.lunch) })
    if (meals?.dinner)    markers.push({ label: '🍽️', time: meals.dinner,    pct: timeToPercent(meals.dinner) })
    return markers
  }, [meals])

  if (medications.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
          24-Hour Medication Timeline
        </h3>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {allDoses.length} dose{allDoses.length !== 1 ? 's' : ''} scheduled
        </span>
      </div>

      {/* Timeline track */}
      <div className="relative" style={{ height: '80px' }}>
        {/* Background track */}
        <div className="absolute inset-x-0 top-8 h-2 rounded-full"
          style={{ background: 'var(--bg-elevated)' }} />

        {/* Hour ticks */}
        {HOUR_LABELS.map((label, i) => (
          <div key={i} className="absolute" style={{ left: `${(i / 12) * 100}%`, top: 0, transform: 'translateX(-50%)' }}>
            <div className="absolute top-8 w-px h-3" style={{ background: 'rgba(255,255,255,0.08)', left: '50%' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)', fontSize: '9px' }}>{label}</span>
          </div>
        ))}

        {/* Meal markers */}
        {mealMarkers.map((meal, i) => (
          <div key={i} className="absolute" style={{ left: `${meal.pct}%`, top: '20px', transform: 'translateX(-50%)', zIndex: 10 }}>
            <div className="text-sm" title={`Meal: ${meal.time}`}>{meal.label}</div>
            <div className="absolute top-5 w-px h-8 opacity-30" style={{ background: '#fbbf24', left: '50%' }} />
          </div>
        ))}

        {/* Dose markers */}
        {allDoses.map((dose, i) => (
          <div key={i} className="absolute group"
            style={{ left: `${dose.pct}%`, top: '24px', transform: 'translateX(-50%)', zIndex: 20 }}>
            <div className="w-4 h-4 rounded-full border-2 border-white shadow-lg cursor-pointer transition-transform hover:scale-125"
              style={{ background: dose.colour }}
              title={`${dose.drug} at ${dose.time}`} />
            {/* Tooltip */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden group-hover:block z-30 pointer-events-none">
              <div className="px-2 py-1.5 rounded-lg text-xs whitespace-nowrap shadow-xl"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                <div className="font-medium capitalize">{dose.drug}</div>
                <div style={{ color: 'var(--text-muted)' }}>{dose.time} · {dose.window}</div>
                {dose.indication && <div style={{ color: 'var(--text-muted)' }}>For: {dose.indication}</div>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {medications.map(med => (
          <div key={med.drug_name} className="flex items-center gap-1.5 text-xs">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: drugColourMap[med.drug_name] }} />
            <span className="capitalize" style={{ color: 'var(--text-secondary)' }}>{med.drug_name}</span>
            {med.times.length > 0 && (
              <span style={{ color: 'var(--text-muted)' }}>({med.times.join(', ')})</span>
            )}
          </div>
        ))}
        {mealMarkers.map((m, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs">
            <span>{m.label}</span>
            <span style={{ color: 'var(--text-muted)' }}>{m.time}</span>
          </div>
        ))}
      </div>

      {/* Time window badges */}
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(
          allDoses.reduce((acc, d) => {
            acc[d.window] = (acc[d.window] || 0) + 1
            return acc
          }, {})
        ).map(([window, count]) => {
          const c = WINDOW_COLOURS[window] || WINDOW_COLOURS.Morning
          return (
            <span key={window} className="text-xs px-2.5 py-1 rounded-full"
              style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
              {window}: {count} dose{count !== 1 ? 's' : ''}
            </span>
          )
        })}
      </div>
    </div>
  )
}
