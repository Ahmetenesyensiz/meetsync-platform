import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '../hooks/useApi'
import Card from '../components/Card'
import Button from '../components/Button'
import { CalendarDays, Plus } from 'lucide-react'
import { format } from 'date-fns'

export default function Meetings() {
  const navigate = useNavigate()
  const { data: meetings = [], isLoading } = useQuery({
    queryKey: ['myMeetings'],
    queryFn: () => api.getMyMeetings().then(r => r.data),
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Toplantılarım</h1>
        <Button icon={Plus} onClick={() => navigate('/meetings/new')}>Yeni Toplantı</Button>
      </div>
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>Yükleniyor...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {meetings.map(m => (
            <Card key={m.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontWeight: 700, marginBottom: 8 }}>{m.title}</h3>
                  <p style={{ color: 'var(--text-3)', fontSize: '0.9rem' }}>
                    {format(new Date(m.startTime), 'dd/MM/yyyy HH:mm')}
                  </p>
                </div>
                <CalendarDays size={20} color="var(--primary)" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
