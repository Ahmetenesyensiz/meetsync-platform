export default function Input({ label, error, icon: Icon, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-2)' }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {Icon && (
          <div style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-3)', pointerEvents: 'none'
          }}>
            <Icon size={15} />
          </div>
        )}
        <input {...props} style={{
          width: '100%', padding: Icon ? '10px 12px 10px 36px' : '10px 14px',
          border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', outline: 'none',
          background: 'var(--surface)', color: 'var(--text)', transition: 'border 0.15s',
          boxSizing: 'border-box',
          ...props.style
        }}
          onFocus={e => e.target.style.borderColor = 'var(--primary)'}
          onBlur={e => e.target.style.borderColor = error ? 'var(--danger)' : 'var(--border)'}
        />
      </div>
      {error && <span style={{ fontSize: '0.78rem', color: 'var(--danger)' }}>{error}</span>}
    </div>
  )
}
