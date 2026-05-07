import { Moon, AlertTriangle, Wind, Footprints } from 'lucide-react'

const RISK_COLOURS = {
  LOW:      { text: '#6ee7b7', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.2)' },
  MODERATE: { text: '#fbbf24', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)' },
  HIGH:     { text: '#f87171', bg: 'rgba(239,68,68,0.10)',   border: 'rgba(239,68,68,0.3)' },
}

export default function NightTimeRiskPanel({ nighttime }) {
  if (!nighttime || nighttime.drug_count === 0) return null

  const fallC  = RISK_COLOURS[nighttime.fall_risk] || RISK_COLOURS.LOW
  const respC  = RISK_COLOURS[nighttime.respiratory_risk] || RISK_COLOURS.LOW

  return (
    <div className="rounded-2xl border overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(168,85,247,0.06), rgba(99,102,241,0.04))',
        borderColor: nighttime.fall_risk === 'HIGH' ? 'rgba(239,68,68,0.3)' : 'rgba(168,85,247,0.2)',
      }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border)]">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}>
          <Moon size={16} style={{ color: '#d8b4fe' }} />
        </div>
        <div>
          <h3 className="font-display font-semibold text-sm" style={{ color: '#d8b4fe' }}>
            Night-Time Risk Assessment
          </h3>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {nighttime.drug_count} medication{nighttime.drug_count !== 1 ? 's' : ''} scheduled 21:00–06:00
          </p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Risk scores */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl p-3 space-y-2 border text-center"
            style={{ background: fallC.bg, borderColor: fallC.border }}>
            <Footprints size={18} className="mx-auto" style={{ color: fallC.text }} />
            <div className="font-display font-bold text-lg" style={{ color: fallC.text }}>
              {nighttime.fall_risk}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Fall Risk
            </div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Sedation score: {nighttime.night_sedation_score}
            </div>
          </div>

          <div className="rounded-xl p-3 space-y-2 border text-center"
            style={{ background: respC.bg, borderColor: respC.border }}>
            <Wind size={18} className="mx-auto" style={{ color: respC.text }} />
            <div className="font-display font-bold text-lg" style={{ color: respC.text }}>
              {nighttime.respiratory_risk}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Respiratory Risk
            </div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              ACB score: {nighttime.night_acb_score}
            </div>
          </div>
        </div>

        {/* Night drugs list */}
        <div className="space-y-2">
          <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            Medications at night:
          </p>
          {nighttime.night_drugs.map((d, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 border-b border-[var(--border)] last:border-0">
              <div>
                <span className="text-sm capitalize font-medium" style={{ color: 'var(--text-primary)' }}>
                  {d.name}
                </span>
                <span className="text-xs ml-2 font-mono" style={{ color: 'var(--text-muted)' }}>
                  {d.time}
                </span>
                {d.is_narrow_ti && (
                  <span className="ml-2 text-xs px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(168,85,247,0.15)', color: '#c084fc' }}>
                    Narrow TI
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs">
                {d.acb > 0 && (
                  <span className="px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>
                    ACB {d.acb}
                  </span>
                )}
                {d.sedation > 0 && (
                  <span className="px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(168,85,247,0.1)', color: '#d8b4fe' }}>
                    Sed {d.sedation}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {nighttime.fall_risk !== 'LOW' && (
          <div className="flex items-start gap-2 p-3 rounded-xl text-xs"
            style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
            <AlertTriangle size={13} className="shrink-0 mt-0.5" />
            <span>
              High sedation at bedtime significantly increases fall risk when getting up during the night.
              Consider a bedside lamp, non-slip footwear, and ensuring pathways are clear.
              Discuss medication timing with your pharmacist.
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
