import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '../hooks/useApi'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import { DoorOpen, X, Clock, FileText } from 'lucide-react'

export default function Rooms() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showReserve, setShowReserve] = useState(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
  })

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => api.getRooms().then(r => r.data),
  })

  const reserveMutation = useMutation({
    mutationFn: (data) => api.createReservation(data),
    onSuccess: () => {
      setShowReserve(null)
      setForm({ title: '', description: '', startTime: '', endTime: '' })
      queryClient.invalidateQueries(['rooms'])
    }
  })

  const handleReserve = (e) => {
    e.preventDefault()
    if (!showReserve) return
    reserveMutation.mutate({
      roomId: showReserve.id,
      ...form
    })
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 32 }}>Toplantı Odaları</h1>
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>Yükleniyor...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {rooms.map(room => (
            <Card key={room.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <DoorOpen size={20} color="var(--primary)" />
                <h3 style={{ fontWeight: 700 }}>{room.name}</h3>
              </div>
              <p style={{ color: 'var(--text-3)', fontSize: '0.9rem', marginBottom: 16 }}>
                Kapasite: {room.capacity} kişi
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button 
                  size="sm" 
                  variant="secondary"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => navigate(`/rooms/${room.id}`)}
                >
                  Takvimi Gör
                </Button>
                <Button 
                  size="sm"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setShowReserve(room)}
                >
                  Rezerve Et
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Rezervasyon Modal */}
      {showReserve && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000, padding: 20
        }} onClick={() => setShowReserve(null)}>
          <Card style={{ maxWidth: 500, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                {showReserve.name} - Rezervasyon
              </h2>
              <button onClick={() => setShowReserve(null)} style={{
                width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)',
                background: 'transparent', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center'
              }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleReserve} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Input
                label="Rezervasyon Başlığı"
                placeholder="Sprint Planlama"
                icon={FileText}
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                required
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-2)' }}>
                  Açıklama
                </label>
                <textarea
                  placeholder="Rezervasyon detayları..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  style={{
                    width: '100%', padding: '10px 14px', minHeight: 80,
                    border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                    fontSize: '0.9rem', outline: 'none', background: 'var(--surface)',
                    color: 'var(--text)', fontFamily: 'inherit', resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Input
                  label="Başlangıç"
                  type="datetime-local"
                  icon={Clock}
                  value={form.startTime}
                  onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                  required
                />
                <Input
                  label="Bitiş"
                  type="datetime-local"
                  icon={Clock}
                  value={form.endTime}
                  onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <Button variant="secondary" onClick={() => setShowReserve(null)}>
                  İptal
                </Button>
                <Button type="submit" loading={reserveMutation.isPending}>
                  Rezerve Et
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
