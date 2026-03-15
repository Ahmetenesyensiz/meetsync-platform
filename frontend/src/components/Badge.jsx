const variants = {
  success: { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' },
  warning: { bg: '#fef9c3', color: '#a16207', border: '#fde68a' },
  danger: { bg: '#fee2e2', color: '#b91c1c', border: '#fecaca' },
  info: { bg: '#dbeafe', color: '#1d4ed8', border: '#bfdbfe' },
  default: { bg: 'var(--surface-2)', color: 'var(--text-2)', border: 'var(--border)' },
}

export default function Badge({ children, variant = 'default' }) {
  const v = variants[variant] || variants.default
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', borderRadius: 100,
      fontSize: '0.72rem', fontWeight: 600,
      background: v.bg, color: v.color, border: `1px solid ${v.border}`
    }}>
      {children}
    </span>
  )
}
