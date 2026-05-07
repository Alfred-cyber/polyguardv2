import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { Shield, Activity, Info, FlaskConical } from 'lucide-react'
import clsx from 'clsx'

const navLinks = [
  { to: '/',       label: 'Home',    icon: Shield },
  { to: '/assess', label: 'Assess',  icon: FlaskConical },
  { to: '/about',  label: 'About',   icon: Info },
]

export default function Layout() {
  const { pathname } = useLocation()

  return (
    <div className="min-h-screen noise-bg flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Background grid */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(rgba(23,179,116,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(23,179,116,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }} />

      {/* Glow orbs */}
      <div className="fixed top-[-20vh] right-[-10vw] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(23,179,116,0.06) 0%, transparent 70%)' }} />
      <div className="fixed bottom-[-20vh] left-[-10vw] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)' }} />

      {/* Nav */}
      <nav className="relative z-10 border-b border-[var(--border)] glass">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #17b374, #0d9260)' }}>
              <Shield size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight gradient-text">
              PolyGuard
            </span>
          </NavLink>

          <div className="flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} end={to === '/'}
                className={({ isActive }) => clsx(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
                )}>
                <Icon size={15} />
                {label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
            <Activity size={12} className="text-brand-500" />
            <span>Research Tool</span>
          </div>
        </div>
      </nav>

      {/* Page */}
      <main className="relative z-10 flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[var(--border)] py-6">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[var(--text-muted)]">
            PolyGuard © 2024 · Alfred Bartholomew Sunday · University of Greater Manchester
          </p>
          <p className="text-xs text-[var(--text-muted)] text-center">
            ⚠️ For research purposes only. Not a substitute for professional medical advice.
          </p>
        </div>
      </footer>
    </div>
  )
}
