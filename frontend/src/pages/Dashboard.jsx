import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { api } from '../hooks/useApi'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import Badge from '../components/Badge'
import Button from '../components/Button'
import { CalendarDays, Clock, DoorOpen, Plus, Users, TrendingUp, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

function StatusBadge({ status }) {
  const map = {
    SCHEDULED: { label: 'Planlandı', variant: 'info' },
    IN_PROGRESS: { label: 'Devam Ediyor', variant: 'success' },
    COMPLETED: { label: 'Tamamlandı', variant: 'default' },
    CANCELLED: { label: 'İptal', variant: 'danger' },
  }
  const s = map[status] || map.SCHEDULED
  return <Badge variant={s.variant}>{s.label}</Badge>
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data: meetings = [], isLoading: meetingsLoading } = useQuery({
    queryKey: ['myMeetings'],
    queryFn: () => api.getMyMeetings().then(r => r.data),
  })

  const { data: reservations = [] } = useQuery({
    queryKey: ['myReservations'],
    queryFn: () => api.getMyReservations().then(r => r.data),
  })

  const today = new Date()
  const todayMeetings = meetings.filter(m => {
    const d = new Date(m.startTime)
    return d.toDateString() === today.toDateString()
  })

  const upcomingMeetings = meetings
    .filter(m => new Date(m.startTime) > today && m.status === 'SCHEDULED')
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    .slice(0, 5)

  const stats = [
    { label: "Bugünkü Toplantılar", value: todayMeetings.length, icon: CalendarDays, color: 'var(--primary)', bg: 'var(--primary-light)' },
    { label: "Yaklaşan Toplantılar", value: upcomingMeetings.length, icon: TrendingUp, color: '#0ea5e9', bg: '#e0f2fe' },
    { label: "Rezervasyonlarım", value: reservations.length, icon: DoorOpen, color: '#10b981', bg: '#d1fae5' },
    { label: "Toplam Toplantı", value: meetings.length, icon: CheckCircle, color: '#8b5cf6', bg: '#ede9fe' },
  ]

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px' }}>
          Hoş Geldiniz, {user?.fullName?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text-3)', marginTop: 6 }}>
          {format(today, "d MMMM yyyy, EEEE", { locale: tr })}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
        {stats.map(stat => (
          <Card key={stat.label}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-3)', fontWeight: 500, marginBottom: 8 }}>
                  {stat.label}
                </p>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>
                  {stat.value}
                </p>
              </div>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <stat.icon size={22} color={stat.color} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Bugünkü Toplantılar</h2>
            <Button size="sm" variant="secondary" icon={Plus} onClick={() => navigate('/meetings/new')}>
              Yeni
            </Button>
          </div>
          {meetingsLoading ? (
            <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-3)' }}>Yükleniyor...</div>
          ) : todayMeetings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32 }}>
              <CalendarDays size={32} color="var(--text-3)" style={{ margin: '0 auto 12px' }} />
              <p style={{ color: 'var(--text-3)' }}>Bugün toplantı yok</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {todayMeetings.map(m => (
                <div key={m.id} style={{
                  padding: '14px 16px', background: 'var(--surface-2)',
                  borderRadius: 'var(--radius)', border: '1px solid var(--border)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>{m.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-3)', fontSize: '0.8rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={12} />
                        {format(new Date(m.startTime), 'HH:mm')} - {format(new Date(m.endTime), 'HH:mm')}
                      </span>
                      {m.roomName && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <DoorOpen size={12} />
                          {m.roomName}
                        </span>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={m.status} />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Yaklaşan Toplantılar</h2>
            <Button size="sm" variant="ghost" onClick={() => navigate('/meetings')}>Tümünü Gör</Button>
          </div>
          {upcomingMeetings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32 }}>
              <TrendingUp size={32} color="var(--text-3)" style={{ margin: '0 auto 12px' }} />
              <p style={{ color: 'var(--text-3)' }}>Yaklaşan toplantı yok</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {upcomingMeetings.map(m => (
                <div key={m.id} style={{
                  padding: '14px 16px', background: 'var(--surface-2)',
                  borderRadius: 'var(--radius)', border: '1px solid var(--border)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>{m.title}</div>
                    <div style={{ color: 'var(--text-3)', fontSize: '0.8rem' }}>
                      {format(new Date(m.startTime), 'd MMM, HH:mm', { locale: tr })}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-3)', fontSize: '0.8rem' }}>
                    <Users size={13} />
                    {m.participants?.length || 0}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
    