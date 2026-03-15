import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '../hooks/useApi'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import { ArrowLeft, Plus, X, Users, CalendarDays } from 'lucide-react'

export default function NewMeeting() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    roomId: null,
    participantEmails: '',
    generateTeamsLink: false,
    generateMeetLink: false,
  })

  const createMutation = useMutation({
    mutationFn: (data) => api.createMeeting({
      ...data,
      participantEmails: data.participantEmails
        ? data.participantEmails.split(',').map(e => e.trim()).filter(Boolean)
        : []
    }),
    onSuccess: () => {
      navigate('/meetings')
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    createMutation.mutate(form)
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 32 }}>
        Yeni Toplantı Oluştur
      </h1>

      <Card style={{ maxWidth: 700 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Input
            label="Toplantı Başlığı"
            placeholder="Sprint Planlama Toplantısı"
            icon={CalendarDays}
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            required
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-2)' }}>
              Açıklama
            </label>
            <textarea
              placeholder="Toplantı detayları..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              style={{
                width: '100%', padding: '10px 14px', minHeight: 100,
                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                fontSize: '0.9rem', outline: 'none', background: 'var(--surface)',
                color: 'var(--text)', fontFamily: 'inherit', resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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

          <Input
            label="Katılımcılar (Email, virgülle ayırın)"
            placeholder="ahmet@sirket.com, mehmet@sirket.com"
            icon={Users}
            value={form.participantEmails}
            onChange={e => setForm(f => ({ ...f, participantEmails: e.target.value }))}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.generateTeamsLink}
                onChange={e => setForm(f => ({ ...f, generateTeamsLink: e.target.checked }))}
              />
              <span style={{ fontSize: '0.9rem', color: 'var(--text-2)' }}>
                Microsoft Teams linki oluştur
              </span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.generateMeetLink}
                onChange={e => setForm(f => ({ ...f, generateMeetLink: e.target.checked }))}
              />
              <span style={{ fontSize: '0.9rem', color: 'var(--text-2)' }}>
                Google Meet linki oluştur
              </span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button variant="secondary" onClick={() => navigate('/meetings')}>
              İptal
            </Button>
            <Button type="submit" loading={createMutation.isPending}>
              Toplantı Oluştur
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
