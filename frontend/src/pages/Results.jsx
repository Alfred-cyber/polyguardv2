import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { ArrowLeft, RotateCcw, Info, Printer } from 'lucide-react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip
} from 'recharts'
import BurdenHeatmap       from '../components/BurdenHeatmap'
import WindowRiskCards     from '../components/WindowRiskCards'
import NightTimeRiskPanel  from '../components/NightTimeRiskPanel'
import TimingViolationsPanel from '../components/TimingViolationsPanel'
import RecommendationsList from '../components/RecommendationsList'
import DailyTimeline       from '../components/DailyTimeline'

// ── Risk Gauge ─────────────────────────────────────────────────────────────────
function RiskGauge({ percent, colour }) {
  const radius = 70
  const circ   = Math.PI * radius       // half circle
  const dash   = (percent / 100) * circ
  const cx = 100, cy = 110

  return (
    <div className="relative flex items-center justify-center" style={{ width: 200, height: 120 }}>
      <svg width="200" height="120" viewBox="0 0 200 120">
        <path d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" strokeLinecap="round" />
        <path d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none" stroke={colour} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ filter: `drop-shadow(0 0 8px ${colour}88)`, transition: 'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div className="absolute bottom-0 text-center">
        <div className="font-display font-bold text-4xl" style={{ color: colour }}>{percent}%</div>
        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>risk score</div>
      </div>
    </div>
  )
}

// ── SHAP Bar ───────────────────────────────────────────────────────────────────
function ShapBar({ label, value, maxVal }) {
  const pct = maxVal > 0 ? Math.min(Math.abs(value) / maxVal, 1) * 100 : 0
  const pos = value >= 0
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span className="font-mono" style={{ color: pos ? '#f87171' : '#6ee7b7' }}>
          {pos ? '+' : ''}{value.toFixed(3)}
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: pos
              ? 'linear-gradient(90deg,#f87171,#ef4444)'
              : 'linear-gradient(90deg,#6ee7b7,#10b981)',
          }} />
      </div>
    </div>
  )
}

const FEAT_LABELS = {
  acb_total:'ACB Total', acb_max:'ACB Max', num_drugs:'Drug Count',
  polypharmacy_flag:'Polypharmacy', high_risk_combo:'High-Risk Combo',
  cns_drug_count:'CNS Drugs', age_risk:'Age Risk (65+)', age:'Age',
  sex_encoded:'Sex', weight_kg:'Weight', acb_drug_count:'Anticholinergic Drugs',
}

const SEV_STYLE = {
  contraindicated:{ bg:'rgba(239,68,68,0.12)', border:'rgba(239,68,68,0.4)',  text:'#f87171', dot:'#ef4444' },
  critical:       { bg:'rgba(239,68,68,0.08)', border:'rgba(239,68,68,0.3)',  text:'#f87171', dot:'#ef4444' },
  high:           { bg:'rgba(245,158,11,0.08)',border:'rgba(245,158,11,0.3)', text:'#fbbf24', dot:'#f59e0b' },
  moderate:       { bg:'rgba(59,130,246,0.08)',border:'rgba(59,130,246,0.3)', text:'#93c5fd', dot:'#3b82f6' },
  info:           { bg:'rgba(99,102,241,0.06)',border:'rgba(99,102,241,0.2)', text:'#a5b4fc', dot:'#6366f1' },
  none:           { bg:'rgba(16,185,129,0.06)',border:'rgba(16,185,129,0.2)', text:'#6ee7b7', dot:'#10b981' },
}

export default function Results() {
  const { state } = useLocation()
  const navigate  = useNavigate()

  useEffect(() => { if (!state?.result) navigate('/assess') }, [state, navigate])
  if (!state?.result) return null

  const { result, mode, profile, meals, medications } = state
  const shap    = result.shap_contributions || {}
  const feats   = result.features || {}
  const colour  = result.risk_colour || '#17b374'
  const maxShap = Math.max(...Object.values(shap).map(Math.abs), 0.001)
  const isFull  = mode === 'full'

  const radarData = [
    { subject: 'ACB Burden',   A: Math.min((feats.acb_total||0)/9*100, 100) },
    { subject: 'Drug Count',   A: Math.min((feats.num_drugs||0)/10*100, 100) },
    { subject: 'CNS Drugs',    A: Math.min((feats.cns_drug_count||0)/5*100, 100) },
    { subject: 'Age Risk',     A: (feats.age_risk||0)*100 },
    { subject: 'Combo Risk',   A: (feats.high_risk_combo||0)*100 },
    { subject: 'Polypharmacy', A: (feats.polypharmacy_flag||0)*100 },
  ]

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-6 print:py-4 print:space-y-4">

      {/* Nav */}
      <div className="flex items-center justify-between animate-fade-up print:hidden">
        <Link to="/assess" className="flex items-center gap-2 text-sm hover:text-[var(--text-primary)] transition-colors"
          style={{ color: 'var(--text-secondary)' }}>
          <ArrowLeft size={15} /> Back
        </Link>
        <div className="flex gap-2">
          <button onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-[var(--border)] hover:border-[var(--border-hover)] transition-all"
            style={{ color: 'var(--text-secondary)' }}>
            <Printer size={13} /> Print Report
          </button>
          <button onClick={() => navigate('/assess')}
            className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm">
            <RotateCcw size={13} /> New Assessment
          </button>
        </div>
      </div>

      {/* ── Hero risk card ── */}
      <div className="card animate-fade-up relative overflow-hidden"
        style={{ border: `1px solid ${colour}33`, background: `linear-gradient(135deg, ${colour}08, var(--bg-card))` }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"
          style={{ background: `radial-gradient(circle, ${colour}10 0%, transparent 70%)` }} />

        <div className="relative flex flex-col sm:flex-row items-center gap-6">
          <RiskGauge percent={result.risk_percent} colour={colour} />

          <div className="flex-1 space-y-4 text-center sm:text-left">
            <div>
              <div className="risk-pill mb-3 inline-flex"
                style={{ background: `${colour}15`, color: colour, border: `1px solid ${colour}40` }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: colour }} />
                {result.risk_level} RISK · {isFull ? 'Full' : 'Quick'} Assessment
              </div>
              <h1 className="font-display font-bold text-3xl">Polypharmacy Risk Report</h1>
            </div>

            <div className="grid grid-cols-4 gap-2 text-sm">
              {[
                { label:'medications', value: feats.num_drugs || 0 },
                { label:'ACB total',  value: feats.acb_total  || 0 },
                { label:'CNS drugs',  value: feats.cns_drug_count || 0 },
                { label:'interactions',value: result.interactions?.length || 0 },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl p-3 text-center" style={{ background: 'rgba(0,0,0,0.2)' }}>
                  <div className="font-display font-bold text-xl">{value}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Timeline (full mode) ── */}
      {isFull && medications?.length > 0 && (
        <div className="card animate-fade-up" style={{ animationDelay: '60ms' }}>
          <DailyTimeline medications={medications} meals={meals} />
        </div>
      )}

      {/* ── 24hr burden curve (full mode) ── */}
      {isFull && result.daily_burden_curve && (
        <div className="card animate-fade-up" style={{ animationDelay: '80ms' }}>
          <BurdenHeatmap curve={result.daily_burden_curve} />
        </div>
      )}

      {/* ── 2-column: factors + radar ── */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Risk factors */}
        <div className="card space-y-3 animate-fade-up" style={{ animationDelay: '100ms' }}>
          <h2 className="font-display font-semibold text-base">Risk Factors</h2>
          <div className="space-y-2.5">
            {result.factors?.map((f, i) => {
              const s = SEV_STYLE[f.severity] || SEV_STYLE.info
              return (
                <div key={i} className="rounded-xl p-3.5 border" style={{ background: s.bg, borderColor: s.border }}>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: s.dot }} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: s.text }}>{f.title}</p>
                      <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.detail}</p>
                      {f.timing_note && (
                        <p className="text-xs mt-1 font-medium" style={{ color: '#fbbf24' }}>{f.timing_note}</p>
                      )}
                      {f.suggestion && (
                        <p className="text-xs mt-1" style={{ color: '#67e8f9' }}>💡 {f.suggestion}</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Radar */}
        <div className="card space-y-3 animate-fade-up" style={{ animationDelay: '120ms' }}>
          <h2 className="font-display font-semibold text-base">Risk Profile</h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Each axis shows normalised risk (0–100%)</p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.05)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
              <Radar dataKey="A" stroke={colour} fill={colour} fillOpacity={0.15} strokeWidth={2} />
              <Tooltip contentStyle={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:8, fontSize:12 }}
                formatter={v => [`${v.toFixed(0)}%`, 'Risk']} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Window analysis (full only) ── */}
      {isFull && result.window_analysis && (
        <div className="card animate-fade-up" style={{ animationDelay: '140ms' }}>
          <WindowRiskCards windows={result.window_analysis} />
        </div>
      )}

      {/* ── Timing violations (full only) ── */}
      {isFull && (
        <div className="card animate-fade-up" style={{ animationDelay: '160ms' }}>
          <TimingViolationsPanel violations={result.timing_violations} />
        </div>
      )}

      {/* ── Night-time risk (full only) ── */}
      {isFull && result.nighttime_risk && (
        <div className="animate-fade-up" style={{ animationDelay: '180ms' }}>
          <NightTimeRiskPanel nighttime={result.nighttime_risk} />
        </div>
      )}

      {/* ── Recommendations (full only) ── */}
      {isFull && result.recommendations && (
        <div className="card animate-fade-up" style={{ animationDelay: '200ms' }}>
          <RecommendationsList recommendations={result.recommendations} />
        </div>
      )}

      {/* ── SHAP panel ── */}
      {Object.keys(shap).length > 0 && (
        <div className="card space-y-4 animate-fade-up" style={{ animationDelay: '220ms' }}>
          <div>
            <h2 className="font-display font-semibold text-base">SHAP Feature Contributions</h2>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Red = increases risk · Green = decreases risk · Based on SHapley Additive exPlanations.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
            {Object.entries(shap)
              .sort((a,b) => Math.abs(b[1]) - Math.abs(a[1]))
              .map(([feat, val]) => (
                <ShapBar key={feat} label={FEAT_LABELS[feat] || feat} value={val} maxVal={maxShap} />
              ))}
          </div>
        </div>
      )}

      {/* ── Therapeutic duplications ── */}
      {result.therapeutic_duplications?.length > 0 && (
        <div className="card space-y-3 animate-fade-up" style={{ animationDelay: '240ms' }}>
          <h2 className="font-display font-semibold text-base">⚠️ Therapeutic Duplications</h2>
          {result.therapeutic_duplications.map((dup, i) => (
            <div key={i} className="rounded-xl p-4 border text-sm space-y-1"
              style={{ background:'rgba(245,158,11,0.06)', borderColor:'rgba(245,158,11,0.25)' }}>
              <p className="font-medium" style={{ color:'#fbbf24' }}>
                {dup.drug_class} class: {dup.drugs.join(' + ')}
              </p>
              <p className="text-xs" style={{ color:'var(--text-secondary)' }}>{dup.detail}</p>
              <p className="text-xs" style={{ color:'#fbbf24' }}>💡 {dup.recommendation}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Narrow TI drugs ── */}
      {result.narrow_ti_drugs?.length > 0 && (
        <div className="card space-y-3 animate-fade-up" style={{ animationDelay: '260ms' }}>
          <h2 className="font-display font-semibold text-base">🔬 Narrow Therapeutic Index Drugs</h2>
          {result.narrow_ti_drugs.map(({ drug, info }, i) => (
            <div key={i} className="rounded-xl p-4 border text-sm"
              style={{ background:'rgba(168,85,247,0.06)', borderColor:'rgba(168,85,247,0.25)' }}>
              <p className="font-medium capitalize" style={{ color:'#d8b4fe' }}>{drug}</p>
              <p className="text-xs mt-1" style={{ color:'var(--text-secondary)' }}>
                Monitor: {info.monitor}
              </p>
              <p className="text-xs mt-0.5" style={{ color:'var(--text-muted)' }}>{info.note}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Disclaimer ── */}
      <div className="rounded-xl p-4 text-xs leading-relaxed border flex items-start gap-3 animate-fade-up"
        style={{ background:'rgba(99,102,241,0.05)', borderColor:'rgba(99,102,241,0.2)', color:'var(--text-secondary)', animationDelay:'280ms' }}>
        <Info size={14} className="shrink-0 mt-0.5" style={{ color:'#a5b4fc' }} />
        {result.disclaimer}
      </div>

    </div>
  )
}
