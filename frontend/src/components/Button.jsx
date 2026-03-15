export default function Button({
  children, onClick, type = 'button',
  variant = 'primary', size = 'md',
  disabled = false, loading = false,
  icon: Icon, style = {}
}) {
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, var(--primary), #6366f1)',
      color: 'white', border: 'none',
    },
    secondary: {
      background: 'var(--surface)', color: 'var(--text)',
      border: '1px solid var(--border)',
    },
    danger: {
      background: 'var(--danger)', color: 'white', border: 'none',
    },
    ghost: {
      background: 'transparent', color: 'var(--text-2)',
      border: '1px solid transparent',
    }
  }

  const sizes = {
    sm: { padding: '6px 12px', fontSize: '0.8rem' },
    md: { padding: '10px 20px', fontSize: '0.88rem' },
    lg: { padding: '13px 28px', fontSize: '0.95rem' },
  }

  const v = variants[variant] || variants.primary
  const s = sizes[size] || sizes.md

  return (
    <button type={type} onClick={onClick} disabled={disabled || loading}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        borderRadius: 'var(--radius-sm)', fontWeight: 600,
        transition: 'all 0.15s', cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1, ...v, ...s, ...style
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = '0.88' }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.opacity = '1' }}
    >
      {Icon && <Icon size={15} />}
      {loading ? 'Yükleniyor...' : children}
    </button>
  )
}
