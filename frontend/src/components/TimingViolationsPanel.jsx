import { Clock, AlertTriangle, Info } from 'lucide-react'

const SEV_STYLE = {
  critical: { bg:'rgba(239,68,68,0.1)',  border:'rgba(239,68,68,0.3)',  text:'#f87171', dot:'#ef4444' },
  high:     { bg:'rgba(245,158,11,0.08)',border:'rgba(245,158,11,0.3)', text:'#fbbf24', dot:'#f59e0b' },
  moderate: { bg:'rgba(59,130,246,0.08)',border:'rgba(59,130,246,0.3)', text:'#93c5fd', dot:'#3b82f6' },
  low:      { bg:'rgba(16,185,129,0.06)',border:'rgba(16,185,129,0.2)', text:'#6ee7b7', dot:'#10b981' },
}

const TYPE_LABEL = {
  MEAL_TIMING_MISMATCH:        ' Meal Timing',
  SEPARATION_RULE_BREACH:      ' Separation Required',
  NARROW_TI_INTERVAL_WARNING:  ' Narrow Window Drug',
  POSTURE_REMINDER:            ' Posture Required',
  SUBOPTIMAL_TIMING:           ' Suboptimal Timing',
}

export default function TimingViolationsPanel({ violations }) {
  if (!violations || violations.length === 0) return (
    <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
      style={{ background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.2)', color:'#6ee7b7' }}>
      <Info size={14} className="shrink-0" />
      No timing violations detected — your schedule looks well-structured.
    </div>
  )

  const sorted = [...violations].sort((a, b) => {
    const order = { critical:0, high:1, moderate:2, low:3 }
    return (order[a.severity]||4) - (order[b.severity]||4)
  })

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Clock size={15} style={{ color: 'var(--brand)' }} />
        <h3 className="font-display font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
          Timing Violations
        </h3>
        <span className="text-xs px-2 py-0.5 rounded-full font-mono"
          style={{ background:'rgba(239,68,68,0.1)', color:'#f87171', border:'1px solid rgba(239,68,68,0.2)' }}>
          {sorted.length} found
        </span>
      </div>

      <div className="space-y-2.5">
        {sorted.map((v, i) => {
          const s = SEV_STYLE[v.severity] || SEV_STYLE.moderate
          const typeLabel = TYPE_LABEL[v.type] || v.type.replace(/_/g,' ')
          return (
            <div key={i} className="rounded-xl p-4 border space-y-2"
              style={{ background:s.bg, borderColor:s.border }}>
              <div className="flex items-start gap-2.5">
                <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background:s.dot }} />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium" style={{ color:s.text }}>{typeLabel}</span>
                    {v.time && (
                      <span className="text-xs font-mono px-1.5 py-0.5 rounded"
                        style={{ background:'var(--bg-elevated)', color:'var(--text-muted)' }}>
                        {v.time}
                      </span>
                    )}
                    <span className="text-xs font-medium capitalize"
                      style={{ color:'var(--text-muted)' }}>
                      {v.drug}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color:'var(--text-secondary)' }}>
                    {v.detail}
                  </p>
                  {v.suggestion && (
                    <div className="flex items-start gap-1.5 mt-1">
                      <span className="text-xs" style={{ color:'#fbbf24' }}>💡</span>
                      <p className="text-xs" style={{ color:'#fbbf24' }}>{v.suggestion}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
