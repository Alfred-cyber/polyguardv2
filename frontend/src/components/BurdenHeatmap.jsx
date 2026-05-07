import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts'

const HOUR_LABELS = {
  0:'12am',3:'3am',6:'6am',9:'9am',12:'12pm',
  15:'3pm',18:'6pm',21:'9pm',23:'11pm'
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const h = Number(label)
  const timeLabel = `${h === 0 ? 12 : h > 12 ? h - 12 : h}:00 ${h < 12 ? 'am' : 'pm'}`
  return (
    <div className="px-3 py-2 rounded-xl shadow-2xl text-xs space-y-1"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div className="font-mono font-medium" style={{ color: 'var(--text-primary)' }}>{timeLabel}</div>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span style={{ color: 'var(--text-secondary)' }}>{p.name}:</span>
          <span className="font-medium" style={{ color: p.color }}>{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function BurdenHeatmap({ curve }) {
  if (!curve || curve.length === 0) return null

  const maxVal = Math.max(...curve.map(d => Math.max(d.acb_load, d.sedation_load)), 1)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
          24-Hour Pharmacological Burden
        </h3>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded" style={{ background: '#ef4444' }} />
            <span style={{ color: 'var(--text-muted)' }}>ACB Load</span>
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded" style={{ background: '#8b5cf6' }} />
            <span style={{ color: 'var(--text-muted)' }}>Sedation Load</span>
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={curve} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="acbGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="sedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="hour"
            tickFormatter={h => HOUR_LABELS[h] || ''}
            tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            domain={[0, maxVal + 1]}
          />
          {/* Danger threshold line */}
          <ReferenceLine y={3} stroke="rgba(239,68,68,0.4)" strokeDasharray="4 4"
            label={{ value: 'Risk threshold', fill: 'rgba(239,68,68,0.6)', fontSize: 9, position: 'right' }} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="acb_load"      name="ACB Load"
            stroke="#ef4444" fill="url(#acbGrad)" strokeWidth={2} dot={false} />
          <Area type="monotone" dataKey="sedation_load" name="Sedation Load"
            stroke="#8b5cf6" fill="url(#sedGrad)" strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>

      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
        The dashed line marks the risk threshold (score 3+). Peaks above this line indicate windows of elevated anticholinergic or sedative burden.
      </p>
    </div>
  )
}
