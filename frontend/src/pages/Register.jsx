import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { api } from '../hooks/useApi'
import { Mail, Lock, User, Briefcase, CalendarDays } from 'lucide-react'
import Button from '../components/Button'
import Input from '../components/Input'

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', fullName: '', department: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.register(form)
      login(res.data)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Kayıt başarısız.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #667eea15, #764ba215)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(79,70,229,0.3)'
          }}>
            <CalendarDays size={26} color="white" />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px' }}>
            MeetSync
          </h1>
          <p style={{ color: 'var(--text-3)', marginTop: 4, fontSize: '0.9rem' }}>
            Hesap Oluştur
          </p>
        </div>

        <div style={{
          background: 'var(--surface)', borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)', padding: 36, border: '1px solid var(--border)'
        }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 24, color: 'var(--text)' }}>
            Kayıt Ol
          </h2>

          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-sm)',
              padding: '10px 14px', marginBottom: 20, color: 'var(--danger)', fontSize: '0.85rem'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input label="Ad Soyad" type="text" placeholder="Ahmet Enes Yensiz"
              icon={User} value={form.fullName}
              onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} required />
            <Input label="Email" type="email" placeholder="ornek@sirket.com"
              icon={Mail} value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            <Input label="Departman" type="text" placeholder="Yazılım"
              icon={Briefcase} value={form.department}
              onChange={e => setForm(f => ({ ...f, department: e.target.value }))} />
            <Input label="Şifre" type="password" placeholder="••••••••"
              icon={Lock} value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
            <Button type="submit" loading={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
              Hesap Oluştur
            </Button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-3)', fontSize: '0.85rem' }}>
            Zaten hesabın var mı?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Giriş Yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
