import { AlertTriangle, Clock, Copy, ClipboardList, HeartPulse, CheckCircle } from 'lucide-react'

const URGENCY_STYLE = {
  urgent:  { icon: AlertTriangle, bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.25)',  text: '#f87171', badge: 'Urgent',  badgeBg: 'rgba(239,68,68,0.15)' },
  soon:    { icon: Clock,         bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', text: '#fbbf24', badge: 'Soon',    badgeBg: 'rgba(245,158,11,0.15)' },
  review:  { icon: ClipboardList, bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.25)', text: '#93c5fd', badge: 'Review',  badgeBg: 'rgba(59,130,246,0.15)' },
  routine: { icon: CheckCircle,   bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.2)',  text: '#6ee7b7', badge: 'Routine', badgeBg: 'rgba(16,185,129,0.12)' },
}

const TYPE_ICON = {
  interaction:  '⚡',
  timing:       '⏰',
  duplication:  '📋',
  deprescribing:'💊',
  general:      '🩺',
}

export default function RecommendationsList({ recommendations }) {
  if (!recommendations || recommendations.length === 0) return null

  const sorted = [...recommendations].sort((a, b) => a.priority - b.priority)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <HeartPulse size={16} style={{ color: 'var(--brand)' }} />
        <h3 className="font-display font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
          Prioritised Recommendations
        </h3>
        <span className="text-xs px-2 py-0.5 rounded-full font-mono"
          style={{ background: 'var(--brand-glow)', color: 'var(--brand)', border: '1px solid rgba(23,179,116,0.3)' }}>
          {sorted.length} action{sorted.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-2">
        {sorted.map((rec, i) => {
          const s = URGENCY_STYLE[rec.urgency] || URGENCY_STYLE.routine
          const Icon = s.icon
          const typeEmoji = TYPE_ICON[rec.type] || '📌'

          return (
            <div key={i} className="rounded-xl p-4 border space-y-2 transition-all duration-200 hover:border-opacity-60"
              style={{ background: s.bg, borderColor: s.border }}>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: s.badgeBg }}>
                  <Icon size={13} style={{ color: s.text }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-mono font-medium px-1.5 py-0.5 rounded"
                      style={{ background: s.badgeBg, color: s.text }}>
                      {s.badge}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {typeEmoji} {rec.type.charAt(0).toUpperCase() + rec.type.slice(1)}
                    </span>
                  </div>

                  <p className="text-sm font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>
                    {rec.action}
                  </p>

                  <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {rec.reason}
                  </p>
                </div>

                <div className="shrink-0 text-lg font-display font-bold"
                  style={{ color: 'rgba(255,255,255,0.08)' }}>
                  {i + 1}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-start gap-2 text-xs px-3 py-2.5 rounded-xl"
        style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', color: '#a5b4fc' }}>
        <Copy size={12} className="shrink-0 mt-0.5" />
        Bring this report to your next GP or pharmacist appointment to discuss these recommendations.
      </div>
    </div>
  )
}
