import { Link } from 'react-router-dom'
import { ArrowRight, Shield, Brain, Zap, BarChart2, Lock, FlaskConical } from 'lucide-react'

const features = [
  { icon: Brain,     title: 'Anticholinergic Burden',  desc: 'Detects cumulative ACB scores linked to cognitive decline using validated clinical scales.' },
  { icon: Zap,       title: 'Drug Interaction Alerts', desc: 'Flags known high-risk drug combinations including warfarin, opioids, and benzodiazepines.' },
  { icon: BarChart2, title: 'SHAP Explainability',     desc: 'Every prediction is explained with feature-level contributions — no black box.' },
  { icon: Shield,    title: 'Polypharmacy Detection',  desc: 'Identifies patients on 5+ concurrent medications who require structured review.' },
  { icon: FlaskConical, title: 'CNS Risk Modelling',  desc: 'Quantifies central nervous system drug burden for neurologically vulnerable patients.' },
  { icon: Lock,      title: 'Privacy First',           desc: 'No data stored. All assessments are stateless and processed in real time.' },
]

const stats = [
  { value: '5,000+', label: 'FDA adverse event reports trained on' },
  { value: '11',     label: 'Pharmacological risk features' },
  { value: 'SHAP',   label: 'Explainability framework' },
  { value: 'XGBoost',label: 'Gradient boosted model' },
]

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16 space-y-24">

      {/* Hero */}
      <section className="text-center space-y-8 animate-fade-up">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono font-medium border"
          style={{ borderColor: 'var(--border-hover)', color: 'var(--brand)', background: 'var(--brand-glow)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
          MRes Research Project · University of Greater Manchester
        </div>

        <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight">
          Medication safety,{' '}
          <span className="gradient-text">explained.</span>
        </h1>

        <p className="max-w-2xl mx-auto text-lg text-[var(--text-secondary)] leading-relaxed">
          PolyGuard uses explainable AI to detect polypharmacy risk in real time.
          Enter your medications and receive a transparent, evidence-based risk assessment
          — not just a score, but a reason.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/assess" className="btn-primary flex items-center gap-2 text-base">
            Start Risk Assessment
            <ArrowRight size={18} />
          </Link>
          <Link to="/about" className="px-6 py-3 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-all duration-200">
            How it works
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="card text-center space-y-2 glass-hover"
            style={{ animationDelay: `${i * 80}ms` }}>
            <div className="font-display font-bold text-2xl gradient-text">{s.value}</div>
            <div className="text-xs text-[var(--text-muted)] leading-snug">{s.label}</div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section className="space-y-10">
        <div className="text-center space-y-3">
          <h2 className="font-display font-bold text-3xl">What PolyGuard analyses</h2>
          <p className="text-[var(--text-secondary)]">Six evidence-based risk dimensions, assessed simultaneously.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <div key={i} className="card glass-hover space-y-4 group"
              style={{ animationDelay: `${i * 60}ms` }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-200"
                style={{ background: 'var(--brand-glow)', border: '1px solid rgba(23,179,116,0.2)' }}>
                <Icon size={18} style={{ color: 'var(--brand)' }} />
              </div>
              <div>
                <h3 className="font-display font-semibold text-base mb-1.5">{title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="card text-center space-y-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(23,179,116,0.08), rgba(13,146,96,0.04))' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(23,179,116,0.06) 0%, transparent 70%)' }} />
        <div className="relative space-y-4">
          <h2 className="font-display font-bold text-3xl">Ready to check your medications?</h2>
          <p className="text-[var(--text-secondary)] max-w-md mx-auto">
            Takes under 2 minutes. No account required. No data stored.
          </p>
          <Link to="/assess" className="btn-primary inline-flex items-center gap-2">
            Begin Assessment <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Disclaimer */}
      <div className="text-center text-xs text-[var(--text-muted)] leading-relaxed max-w-2xl mx-auto pb-4">
        ⚠️ PolyGuard is a research tool developed as part of an MRes project. It is not a medical device, 
        does not provide medical advice, and should not replace consultation with a qualified healthcare professional.
        Always speak to your GP or pharmacist about your medications.
      </div>
    </div>
  )
}
