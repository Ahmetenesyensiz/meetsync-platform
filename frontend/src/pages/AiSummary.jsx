import { useQuery } from '@tanstack/react-query'
import { api } from '../hooks/useApi'
import Card from '../components/Card'
import { Sparkles } from 'lucide-react'

export default function AiSummary() {
  const { data: summaries = [], isLoading } = useQuery({
    queryKey: ['mySummaries'],
    queryFn: () => api.getMySummaries().then(r => r.data),
  })

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 32 }}>AI Toplantı Özetleri</h1>
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>Yükleniyor...</div>
      ) : summaries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Sparkles size={40} color="var(--text-3)" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-3)' }}>Henüz özet oluşturulmamış</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {summaries.map(s => (
            <Card key={s.id}>
              <h3 style={{ fontWeight: 700, marginBottom: 12 }}>{s.meetingTitle}</h3>
              <div style={{ color: 'var(--text-2)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                {s.summary}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
