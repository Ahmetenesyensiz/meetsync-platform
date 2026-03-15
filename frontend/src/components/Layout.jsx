import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  LayoutDashboard, DoorOpen, CalendarDays,
  Plus, Sparkles, LogOut, Bell, ChevronDown,
  User, Users, Calendar
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/calendar', icon: Calendar, label: 'Takvimim' },
  { to: '/rooms', icon: DoorOpen, label: 'Odalar' },
  { to: '/meetings', icon: CalendarDays, label: 'Toplantılar' },
  { to: '/directory', icon: Users, label: 'Şirket Rehberi' },
  { to: '/ai-summary', icon: Sparkles, label: 'AI Özet' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showUser, setShowUser] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <aside style={{
        width: 260, background: 'var(--surface)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', position: 'fixed',
        top: 0, left: 0, height: '100vh', zIndex: 100
      }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <CalendarDays size={18} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)', letterSpacing: '-0.3px' }}>
                MeetSync
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 500 }}>
                Toplantı Yönetimi
              </div>
            </div>
          </div>
        </div>

        <nav style={{ padding: '16px 12px', flex: 1, overflowY: 'auto' }}>
          <div style={{ 
            fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-3)', 
            letterSpacing: '0.08em', padding: '0 8px', marginBottom: 8 
          }}>
            MENÜ
          </div>

          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 'var(--radius-sm)',
              marginBottom: 2, textDecoration: 'none', transition: 'all 0.15s',
              background: isActive ? 'var(--primary-light)' : 'transparent',
              color: isActive ? 'var(--primary)' : 'var(--text-2)',
              fontWeight: isActive ? 600 : 400, fontSize: '0.88rem'
            })}>
              <Icon size={16} />
              {label}
            </NavLink>
          ))}

          <div style={{ marginTop: 12 }}>
            <button onClick={() => navigate('/meetings/new')} style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: 'none',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              color: 'white', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer'
            }}>
              <Plus size={16} />
              Yeni Toplantı
            </button>
          </div>
        </nav>

        <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowUser(!showUser)} style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: 'none',
              background: showUser ? 'var(--surface-2)' : 'transparent', cursor: 'pointer'
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <User size={14} color="white" />
              </div>
              <div style={{ flex: 1, textAlign: 'left', overflow: 'hidden' }}>
                <div style={{ 
                  fontWeight: 600, fontSize: '0.82rem', color: 'var(--text)', 
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' 
                }}>
                  {user?.fullName || 'Kullanıcı'}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>
                  {user?.role || 'USER'}
                </div>
              </div>
              <ChevronDown size={14} color="var(--text-3)" />
            </button>

            {showUser && (
              <div style={{
                position: 'absolute', bottom: '100%', left: 0, right: 0,
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-md)', marginBottom: 4
              }}>
                <button onClick={handleLogout} style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                  padding: '12px 16px', border: 'none', background: 'transparent',
                  color: 'var(--danger)', fontSize: '0.88rem', fontWeight: 500, cursor: 'pointer'
                }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <LogOut size={15} />
                  Çıkış Yap
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <div style={{ marginLeft: 260, flex: 1, minHeight: '100vh' }}>
        <header style={{
          height: 64, background: 'var(--surface)', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          padding: '0 32px', position: 'sticky', top: 0, zIndex: 50,
          boxShadow: 'var(--shadow-sm)'
        }}>
          <button style={{
            width: 36, height: 36, borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)', background: 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            color: 'var(--text-2)', cursor: 'pointer'
          }}>
            <Bell size={16} />
          </button>
        </header>

        <main style={{ padding: '32px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
