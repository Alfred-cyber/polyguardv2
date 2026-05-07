import { Clock, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react'

const RISK_STYLE = {
  LOW:      { bg: 'rgba(16,185,129,0.06)',  border: 'rgba(16,185,129,0.2)',  text: '#6ee7b7', icon: CheckCircle },
  MODERATE: { bg: 'rgba(245,158,11,0.06)',  border: 'rgba(245,158,11,0.2)',  text: '#fbbf24', icon: AlertCircle },
  HIGH:     { bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.25)',  text: '#f87171', icon: AlertTriangle },
  CRITICAL: { bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.4)',   text: '#ef4444', icon: AlertTriangle },
}

const FLAG_SEVERITY_COLOUR = {
  critical: '#ef4444',
  high:     '#f59e0b',
  moderate: '#60a5fa',
  low:      '#6ee7b7',
}

export default function WindowRiskCards({ windows }) {
  if (!windows || windows.length === 0) return null

  const nonEmpty = windows.filter(w => w.drug_count > 0)
  if (nonEmpty.length === 0) return null

  return (
    <div className="space-y-3">
      <h3 className="font-display font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
        Risk by Time Window
      </h3>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {nonEmpty.map((w, i) => {
          const s = RISK_STYLE[w.risk_level] || RISK_STYLE.LOW
          const Icon = s.icon
          return (
            <div key={i} className="rounded-xl p-4 space-y-3 border"
              style={{ background: s.bg, borderColor: s.border }}>

              {/* Window header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} style={{ color: s.text }} />
                    <span className="font-display font-semibold text-sm" style={{ color: s.text }}>
                      {w.window}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{w.time_range}</p>
                </div>
                <span className="risk-pill text-xs" style={{
                  background: s.bg,
                  color: s.text,
                  border: `1px solid ${s.border}`,
                }}>
                  {w.risk_level}
                </span>
              </div>

              {/* Scores */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                    {w.drug_count}
                  </div>
                  <div style={{ color: 'var(--text-muted)' }}>drugs</div>
                </div>
                <div className="text-center">
                  <div className="font-display font-bold text-base"
                    style={{ color: w.acb_score >= 3 ? '#f87171' : 'var(--text-primary)' }}>
                    {w.acb_score}
                  </div>
                  <div style={{ color: 'var(--text-muted)' }}>ACB</div>
                </div>
                <div className="text-center">
                  <div className="font-display font-bold text-base"
                    style={{ color: w.sedation_score >= 3 ? '#d8b4fe' : 'var(--text-primary)' }}>
                    {w.sedation_score}
                  </div>
                  <div style={{ color: 'var(--text-muted)' }}>sedation</div>
                </div>
              </div>

              {/* Drugs in window */}
              <div className="flex flex-wrap gap-1">
                {w.drugs.map((d, di) => (
                  <span key={di} className="text-xs px-2 py-0.5 rounded capitalize"
                    style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                    {d.name}
                  </span>
                ))}
              </div>

              {/* Flags */}
              {w.flags?.length > 0 && (
                <div className="space-y-1.5">
                  {w.flags.map((f, fi) => (
                    <div key={fi} className="flex items-start gap-1.5 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full mt-1 shrink-0"
                        style={{ background: FLAG_SEVERITY_COLOUR[f.severity] || '#6ee7b7' }} />
                      <span style={{ color: 'var(--text-secondary)' }}>{f.detail}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
