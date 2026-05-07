import { BookOpen, Code2, Database, FlaskConical, GraduationCap, Shield } from 'lucide-react'

const timeline = [
  { icon: BookOpen,     label: 'Phase 1', title: 'Literature Review',         desc: 'Polypharmacy, neurotoxicity, drug-diet interactions, explainable AI in healthcare.' },
  { icon: Code2,        label: 'Phase 2', title: 'System Architecture',        desc: 'React + FastAPI stack, SHAP explainability module, non-diagnostic framing.' },
  { icon: Database,     label: 'Phase 3', title: 'Data Preparation',           desc: 'FDA OpenFDA API (5,000+ records), ACB scale encoding, synthetic profile generation.' },
  { icon: FlaskConical, label: 'Phase 4', title: 'Model Development',          desc: 'XGBoost with SMOTE balancing, 5-fold cross-validation, hyperparameter tuning.' },
  { icon: Shield,       label: 'Phase 5', title: 'SHAP Explainability',        desc: 'TreeExplainer, waterfall plots, plain-English risk explanations per patient.' },
  { icon: GraduationCap,label: 'Phase 6', title: 'Evaluation & Dissertation',  desc: 'Heuristic usability review, expert validation, MRes dissertation submission.' },
]

const refs = [
  'Ettefaghian et al. (2023). Polypharmacy and neurodegenerative risk.',
  'Bishara et al. (2017). Anticholinergic Cognitive Burden (ACB) scale.',
  'Lundberg & Lee (2017). A unified approach to interpreting model predictions. NeurIPS.',
  'Chen & Guestrin (2016). XGBoost: A scalable tree boosting system. KDD.',
  'Allen (2024). Explainable AI in medication safety systems.',
  'Kim & Pavon (2024). Polypharmacy assessment tools in clinical practice.',
  'Taylor-Rowan et al. (2023). Anticholinergic burden and dementia risk.',
  'Andrews et al. (2025). Drug-diet interactions in neurological populations.',
]

export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-14 space-y-14">

      <div className="space-y-4 animate-fade-up">
        <h1 className="font-display font-bold text-4xl">About PolyGuard</h1>
        <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
          PolyGuard is an MRes research project exploring the application of explainable artificial
          intelligence to polypharmacy risk detection, developed at the University of Greater Manchester
          under the supervision of Dr Anthony Ojo.
        </p>
      </div>

      {/* Research problem */}
      <section className="card space-y-4 animate-fade-up" style={{ animationDelay: '60ms' }}>
        <h2 className="font-display font-semibold text-xl">The Research Problem</h2>
        <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
          Polypharmacy — the concurrent use of five or more medications — affects a growing proportion of
          older adults and individuals with neurodegenerative disorders. While clinical tools such as the
          Beer's Criteria and STOPP/START guidelines provide rule-based assessment of potentially harmful
          drug combinations, they are <strong className="text-[var(--text-primary)]">static, clinician-facing, and do not adapt
          to individual pharmacological profiles</strong>.
        </p>
        <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
          PolyGuard addresses this gap by combining machine learning prediction with SHAP-based explainability,
          anticholinergic burden scoring, and CNS drug risk modelling — delivering transparent, actionable
          risk assessments that support informed conversations between patients and healthcare professionals.
        </p>
      </section>

      {/* Technical architecture */}
      <section className="space-y-5 animate-fade-up" style={{ animationDelay: '100ms' }}>
        <h2 className="font-display font-semibold text-xl">Technical Architecture</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: 'Frontend',       value: 'React 18 · Vite · Tailwind CSS · Recharts · Framer Motion' },
            { label: 'Backend',        value: 'Python · FastAPI · Uvicorn · Pydantic v2' },
            { label: 'ML Model',       value: 'XGBoost (tuned) · SMOTE · 5-fold cross-validation' },
            { label: 'Explainability', value: 'SHAP TreeExplainer · Waterfall + Beeswarm plots' },
            { label: 'Data Source',    value: 'FDA OpenFDA Drug Adverse Events API (open access)' },
            { label: 'ACB Scale',      value: 'Bishara et al. (2017) — 57 drugs scored 1–3' },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl p-4 border border-[var(--border)]"
              style={{ background: 'var(--bg-elevated)' }}>
              <div className="text-xs font-mono text-brand-400 mb-1">{label}</div>
              <div className="text-sm text-[var(--text-secondary)]">{value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="space-y-5 animate-fade-up" style={{ animationDelay: '140ms' }}>
        <h2 className="font-display font-semibold text-xl">Research Phases</h2>
        <div className="space-y-3">
          {timeline.map(({ icon: Icon, label, title, desc }, i) => (
            <div key={i} className="flex gap-4 items-start card glass-hover">
              <div className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center"
                style={{ background: 'var(--brand-glow)', border: '1px solid rgba(23,179,116,0.2)' }}>
                <Icon size={16} style={{ color: 'var(--brand)' }} />
              </div>
              <div>
                <div className="text-xs font-mono text-[var(--text-muted)] mb-0.5">{label}</div>
                <div className="font-display font-semibold text-sm mb-1">{title}</div>
                <div className="text-sm text-[var(--text-secondary)]">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ethics */}
      <section className="card border-amber-500/20 animate-fade-up"
        style={{ animationDelay: '180ms', background: 'rgba(245,158,11,0.04)' }}>
        <h2 className="font-display font-semibold text-lg mb-3">Ethical Considerations</h2>
        <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
          {[
            'No identifiable patient data is collected, processed, or stored.',
            'All training data is from open, publicly available FDA sources.',
            'Outputs are framed as informational risk flags, not diagnoses.',
            'Clear disclaimers are presented at every interaction point.',
            'The system is designed to support — not replace — clinical judgment.',
          ].map((point, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
              {point}
            </li>
          ))}
        </ul>
      </section>

      {/* References */}
      <section className="space-y-4 animate-fade-up" style={{ animationDelay: '220ms' }}>
        <h2 className="font-display font-semibold text-xl">Key References</h2>
        <ol className="space-y-2">
          {refs.map((ref, i) => (
            <li key={i} className="text-sm text-[var(--text-secondary)] flex gap-3">
              <span className="font-mono text-xs text-[var(--text-muted)] shrink-0 mt-0.5">[{i+1}]</span>
              {ref}
            </li>
          ))}
        </ol>
      </section>

    </div>
  )
}
