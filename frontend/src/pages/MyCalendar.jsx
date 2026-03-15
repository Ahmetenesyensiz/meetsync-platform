import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../hooks/useApi'
import Card from '../components/Card'
import Badge from '../components/Badge'
import { ChevronLeft, ChevronRight, Clock, DoorOpen, Users } from 'lucide-react'
import { format, getDaysInMonth, startOfMonth, getDay, parseISO } from 'date-fns'
import { tr } from 'date-fns/locale'

const STATUS_COLORS = {
  SCHEDULED: { bg: '#dbeafe', color: '#1d4ed8', border: '#bfdbfe' },
  IN_PROGRESS: { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' },
  COMPLETED: { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0' },
  CANCELLED: { bg: '#fee2e2', color: '#b91c1c', border: '#fecaca' },
}

export default function MyCalendar() {
  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1)
  const [selectedDay, setSelectedDay] = useState(format(today, 'yyyy-MM-dd'))

  const { data: meetings = [] } = useQuery({
    queryKey: ['myMeetings'],
    queryFn: () => api.getMyMeetings().then(r => r.data),
  })

  const prevMonth = () => {
    if (currentMonth === 1) { 
      setCurrentYear(y => y - 1)
      setCurrentMonth(12) 
    } else {
      setCurrentMonth(m => m - 1)
    }
  }

  const nextMonth = () => {
    if (currentMonth === 12) { 
      setCurrentYear(y => y + 1)
      setCurrentMonth(1) 
    } else {
      setCurrentMonth(m => m + 1)
    }
  }

  const daysInMonth = getDaysInMonth(new Date(currentYear, currentMonth - 1))
  const firstDayOfWeek = (getDay(startOfMonth(new Date(currentYear, currentMonth - 1))) + 6) % 7

  const getMeetingsForDay = (dateStr) =>
    meetings.filter(m => {
      const d = new Date(m.startTime)
      return format(d, 'yyyy-MM-dd') === dateStr && m.status !== 'CANCELLED'
    })

  const selectedMeetings = getMeetingsForDay(selectedDay).sort((a, b) => 
    new Date(a.startTime) - new Date(b.startTime)
  )

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
          Takvimim
        </h1>
        <p style={{ color: 'var(--text-3)', marginTop: 4 }}>
          Kişisel toplantı takviminiz
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 24 }}>
        {/* Takvim */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <button 
              onClick={prevMonth} 
              style={{
                width: 32, height: 32, border: '1px solid var(--border)', borderRadius: 8,
                background: 'transparent', cursor: 'pointer', display: 'flex', 
                alignItems: 'center', justifyContent: 'center'
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <h3 style={{ fontWeight: 700 }}>
              {format(new Date(currentYear, currentMonth - 1), 'MMMM yyyy', { locale: tr })}
            </h3>
            <button 
              onClick={nextMonth} 
              style={{
                width: 32, height: 32, border: '1px solid var(--border)', borderRadius: 8,
                background: 'transparent', cursor: 'pointer', display: 'flex', 
                alignItems: 'center', justifyContent: 'center'
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 8 }}>
            {['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'].map(d => (
              <div 
                key={d} 
                style={{ 
                  textAlign: 'center', fontSize: '0.72rem', fontWeight: 700, 
                  color: 'var(--text-3)', padding: '4px 0' 
                }}
              >
                {d}
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
            {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1
              const dateStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
              const dayMeetings = getMeetingsForDay(dateStr)
              const isSelected = dateStr === selectedDay
              const isTodayDate = dateStr === format(today, 'yyyy-MM-dd')

              return (
                <button 
                  key={day} 
                  onClick={() => setSelectedDay(dateStr)} 
                  style={{
                    aspectRatio: '1', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', borderRadius: 8,
                    border: isSelected ? '2px solid var(--primary)' : isTodayDate ? '2px solid #c7d2fe' : '2px solid transparent',
                    background: isSelected ? 'var(--primary)' : isTodayDate ? 'var(--primary-light)' : 'transparent',
                    cursor: 'pointer', transition: 'all 0.15s', position: 'relative', padding: 4
                  }}
                >
                  <span style={{
                    fontSize: '0.82rem', 
                    fontWeight: isTodayDate || isSelected ? 700 : 400,
                    color: isSelected ? 'white' : isTodayDate ? 'var(--primary)' : 'var(--text)'
                  }}>
                    {day}
                  </span>
                  {dayMeetings.length > 0 && (
                    <div style={{
                      width: 5, height: 5, borderRadius: '50%',
                      background: isSelected ? 'white' : 'var(--primary)',
                      position: 'absolute', bottom: 3
                    }} />
                  )}
                </button>
              )
            })}
          </div>
        </Card>

        {/* Seçili gün toplantıları */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>
              {format(parseISO(selectedDay), 'd MMMM yyyy, EEEE', { locale: tr })}
            </h3>
            <Badge variant={selectedMeetings.length > 0 ? 'info' : 'success'}>
              {selectedMeetings.length > 0 ? `${selectedMeetings.length} toplantı` : 'Müsait gün'}
            </Badge>
          </div>

          {selectedMeetings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <Clock size={32} color="var(--text-3)" style={{ margin: '0 auto 12px' }} />
              <p style={{ color: 'var(--text-3)' }}>Bu gün toplantı yok</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {selectedMeetings.map(m => {
                const sc = STATUS_COLORS[m.status] || STATUS_COLORS.SCHEDULED
                return (
                  <div 
                    key={m.id} 
                    style={{
                      padding: '16px', borderRadius: 'var(--radius)',
                      background: sc.bg, border: `1px solid ${sc.border}`,
                      borderLeft: `4px solid ${sc.color}`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', marginBottom: 6 }}>
                          {m.title}
                        </div>
                        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-2)', fontSize: '0.82rem' }}>
                            <Clock size={13} />
                            {format(new Date(m.startTime), 'HH:mm')} - {format(new Date(m.endTime), 'HH:mm')}
                          </span>
                          {m.roomName && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-2)', fontSize: '0.82rem' }}>
                              <DoorOpen size={13} />
                              {m.roomName}
                            </span>
                          )}
                          <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-2)', fontSize: '0.82rem' }}>
                            <Users size={13} />
                            {m.participants?.length || 0} katılımcı
                          </span>
                        </div>
                        {m.description && (
                          <p style={{ color: 'var(--text-3)', fontSize: '0.82rem', marginTop: 8 }}>
                            {m.description}
                          </p>
                        )}
                      </div>
                      <Badge variant={
                        m.status === 'SCHEDULED' ? 'info' : 
                        m.status === 'COMPLETED' ? 'default' : 'danger'
                      }>
                        {m.status === 'SCHEDULED' ? 'Planlandı' : 
                         m.status === 'COMPLETED' ? 'Tamamlandı' : 'İptal'}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
