import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../hooks/useApi'
import { useAuth } from '../hooks/useAuth'
import Card from '../components/Card'
import Badge from '../components/Badge'
import Button from '../components/Button'
import {
  ArrowLeft, ChevronLeft, ChevronRight, Clock, DoorOpen,
  Plus, Users, UserPlus, UserMinus, Crown, Shield, User,
  Monitor, Pen, Video, Wind, Building, X
} from 'lucide-react'
import { format, getDaysInMonth, startOfMonth, getDay, parseISO } from 'date-fns'
import { tr } from 'date-fns/locale'

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8)

const ROLE_MAP = {
  OWNER: { label: 'Kurucu', icon: Crown, color: '#f59e0b', bg: '#fef3c7' },
  ADMIN: { label: 'Admin', icon: Shield, color: '#8b5cf6', bg: '#ede9fe' },
  MEMBER: { label: 'Üye', icon: User, color: '#64748b', bg: '#f1f5f9' },
}

function TimelineView({ reservations, onReserve, date }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>
          {format(parseISO(date), 'd MMMM EEEE', { locale: tr })} — Günlük Program
        </h3>
        <Button size="sm" icon={Plus} onClick={onReserve}>Rezervasyon Yap</Button>
      </div>
      <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        {HOURS.map((hour, idx) => {
          const hourReservations = reservations.filter(r => {
            const start = new Date(r.startTime).getHours()
            const end = new Date(r.endTime).getHours()
            return start <= hour && end > hour
          })
          const isBusy = hourReservations.length > 0
          return (
            <div key={hour} style={{
              display: 'flex', borderBottom: idx < HOURS.length - 1 ? '1px solid var(--border)' : 'none',
              background: isBusy ? '#fef9f0' : 'var(--surface)',
              minHeight: 52, alignItems: 'stretch', transition: 'background 0.15s'
            }}>
              <div style={{
                width: 70, padding: '8px 14px', fontSize: '0.78rem', fontWeight: 600,
                color: isBusy ? 'var(--warning)' : 'var(--text-3)', flexShrink: 0,
                borderRight: '1px solid var(--border)', display: 'flex', alignItems: 'center'
              }}>
                {`${hour.toString().padStart(2, '0')}:00`}
              </div>
              <div style={{ flex: 1, padding: '8px 14px', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                {isBusy ? hourReservations.map(r => (
                  <div key={r.id} style={{
                    background: 'linear-gradient(135deg, var(--primary), #6366f1)',
                    color: 'white', borderRadius: 8, padding: '6px 14px', fontSize: '0.82rem', fontWeight: 600
                  }}>
                    <div>{r.title}</div>
                    <div style={{ fontSize: '0.72rem', opacity: 0.85 }}>
                      {format(new Date(r.startTime), 'HH:mm')} — {format(new Date(r.endTime), 'HH:mm')}
                      {r.organizerName && ` · ${r.organizerName}`}
                    </div>
                  </div>
                )) : (
                  <span style={{ color: 'var(--text-3)', fontSize: '0.82rem' }}>Müsait</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function RoomDetail() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const qc = useQueryClient()
  const today = new Date()

  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1)
  const [selectedDay, setSelectedDay] = useState(format(today, 'yyyy-MM-dd'))
  const [showReserveModal, setShowReserveModal] = useState(false)
  const [showAddMember, setShowAddMember] = useState(false)
  const [activeTab, setActiveTab] = useState('calendar')

  const { data: calendarData } = useQuery({
    queryKey: ['roomCalendar', roomId, currentYear, currentMonth],
    queryFn: () => api.getRoomCalendar(roomId, currentYear, currentMonth).then(r => r.data),
  })

  const { data: dayReservations = [] } = useQuery({
    queryKey: ['roomDay', roomId, selectedDay],
    queryFn: () => api.getRoomDay(roomId, selectedDay).then(r => r.data),
  })

  const { data: members = [] } = useQuery({
    queryKey: ['roomMembers', roomId],
    queryFn: () => api.getRoomMembers(roomId).then(r => r.data),
  })

  const { data: allUsers = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.getUsers().then(r => r.data),
  })

  const removeMemberMutation = useMutation({
    mutationFn: (email) => api.removeRoomMember(roomId, email),
    onSuccess: () => qc.invalidateQueries(['roomMembers', roomId])
  })

  const myMembership = members.find(m => m.userEmail === user?.email)
  const canManage = myMembership?.memberRole === 'OWNER' || myMembership?.memberRole === 'ADMIN'

  const prevMonth = () => {
    if (currentMonth === 1) { setCurrentYear(y => y - 1); setCurrentMonth(12) }
    else setCurrentMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (currentMonth === 12) { setCurrentYear(y => y + 1); setCurrentMonth(1) }
    else setCurrentMonth(m => m + 1)
  }

  const daysInMonth = getDaysInMonth(new Date(currentYear, currentMonth - 1))
  const firstDayOfWeek = (getDay(startOfMonth(new Date(currentYear, currentMonth - 1))) + 6) % 7
  const reservationDays = calendarData?.reservations || {}

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <Button variant="secondary" icon={ArrowLeft} size="sm" onClick={() => navigate('/rooms')}>
          Odalar
        </Button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
            {calendarData?.roomName || 'Oda Detayı'}
          </h1>
          <p style={{ color: 'var(--text-3)', fontSize: '0.85rem', marginTop: 2 }}>
            {members.length} üye · Rezervasyon Yönetimi
          </p>
        </div>
        {canManage && (
          <Button icon={UserPlus} onClick={() => setShowAddMember(true)}>
            Üye Ekle
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--surface-2)', padding: 4, borderRadius: 10, width: 'fit-content', border: '1px solid var(--border)' }}>
        {[
          { key: 'calendar', label: 'Takvim', icon: ChevronRight },
          { key: 'members', label: `Üyeler (${members.length})`, icon: Users },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: activeTab === tab.key ? 'var(--surface)' : 'transparent',
            color: activeTab === tab.key ? 'var(--primary)' : 'var(--text-2)',
            fontWeight: activeTab === tab.key ? 700 : 400, fontSize: '0.88rem',
            boxShadow: activeTab === tab.key ? 'var(--shadow-sm)' : 'none',
            transition: 'all 0.15s'
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'calendar' && (
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 24 }}>
          {/* Takvim */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <button onClick={prevMonth} style={{ width: 32, height: 32, border: '1px solid var(--border)', borderRadius: 8, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronLeft size={16} />
              </button>
              <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                {format(new Date(currentYear, currentMonth - 1), 'MMMM yyyy', { locale: tr })}
              </h3>
              <button onClick={nextMonth} style={{ width: 32, height: 32, border: '1px solid var(--border)', borderRadius: 8, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronRight size={16} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 8 }}>
              {['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'].map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-3)', padding: '4px 0' }}>{d}</div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
              {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1
                const dateStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
                const hasRes = reservationDays[dateStr]?.length > 0
                const isSelected = dateStr === selectedDay
                const isTodayDate = dateStr === format(today, 'yyyy-MM-dd')
                return (
                  <button key={day} onClick={() => setSelectedDay(dateStr)} style={{
                    aspectRatio: '1', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', borderRadius: 8,
                    border: isSelected ? '2px solid var(--primary)' : isTodayDate ? '2px solid #c7d2fe' : '2px solid transparent',
                    background: isSelected ? 'var(--primary)' : isTodayDate ? 'var(--primary-light)' : hasRes ? '#fef9c3' : 'transparent',
                    cursor: 'pointer', transition: 'all 0.15s', position: 'relative', padding: 4
                  }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: isTodayDate || isSelected ? 700 : 400, color: isSelected ? 'white' : isTodayDate ? 'var(--primary)' : 'var(--text)' }}>
                      {day}
                    </span>
                    {hasRes && !isSelected && (
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--warning)', position: 'absolute', bottom: 3 }} />
                    )}
                  </button>
                )
              })}
            </div>

            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', gap: 16, fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: '#fef9c3', border: '1px solid var(--border)' }} />
                <span style={{ color: 'var(--text-3)' }}>Rezervasyon var</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--primary)' }} />
                <span style={{ color: 'var(--text-3)' }}>Seçili gün</span>
              </div>
            </div>
          </Card>

          {/* Timeline */}
          <Card>
            <TimelineView
              reservations={dayReservations}
              date={selectedDay}
              onReserve={() => setShowReserveModal(true)}
            />
          </Card>
        </div>
      )}

      {activeTab === 'members' && (
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Oda Üyeleri</h2>
            {canManage && (
              <Button size="sm" icon={UserPlus} onClick={() => setShowAddMember(true)}>
                Üye Ekle
              </Button>
            )}
          </div>

          {members.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)' }}>
              <Users size={32} style={{ margin: '0 auto 12px' }} />
              <p>Henüz üye yok</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
              {members.map(member => {
                const role = ROLE_MAP[member.memberRole] || ROLE_MAP.MEMBER
                const RoleIcon = role.icon
                const initials = member.userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                const isMe = member.userEmail === user?.email
                return (
                  <div key={member.id} style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                    background: isMe ? 'var(--primary-light)' : 'var(--surface-2)',
                    border: `1px solid ${isMe ? '#c7d2fe' : 'var(--border)'}`,
                    borderRadius: 'var(--radius)', position: 'relative'
                  }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                      background: `linear-gradient(135deg, ${role.color}, ${role.color}88)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 700, fontSize: '0.88rem'
                    }}>
                      {initials}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {member.userName}
                        {isMe && <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600 }}>(Sen)</span>}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {member.userEmail}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5,
                        color: role.color, fontSize: '0.75rem', fontWeight: 600 }}>
                        <RoleIcon size={11} />
                        {role.label}
                      </div>
                    </div>
                    {canManage && member.memberRole !== 'OWNER' && !isMe && (
                      <button onClick={() => removeMemberMutation.mutate(member.userEmail)}
                        style={{ position: 'absolute', top: 10, right: 10, width: 26, height: 26,
                          border: '1px solid #fecaca', borderRadius: 6, background: '#fef2f2',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'var(--danger)' }}>
                        <UserMinus size={12} />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      )}

      {/* Reserve Modal */}
      {showReserveModal && (
        <ReserveModal
          roomId={roomId}
          selectedDay={selectedDay}
          members={members}
          onClose={() => setShowReserveModal(false)}
          onSuccess={() => {
            setShowReserveModal(false)
            qc.invalidateQueries(['roomDay', roomId, selectedDay])
            qc.invalidateQueries(['roomCalendar', roomId, currentYear, currentMonth])
          }}
        />
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <AddMemberModal
          roomId={roomId}
          existingEmails={members.map(m => m.userEmail)}
          allUsers={allUsers}
          onClose={() => setShowAddMember(false)}
          onSuccess={() => {
            setShowAddMember(false)
            qc.invalidateQueries(['roomMembers', roomId])
          }}
        />
      )}
    </div>
  )
}

function ReserveModal({ roomId, selectedDay, members, onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: '',
    startTime: `${selectedDay}T09:00`,
    endTime: `${selectedDay}T10:00`,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.createReservation({
        roomId: parseInt(roomId),
        title: form.title,
        startTime: form.startTime,
        endTime: form.endTime,
      })
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Bu saatte oda dolu olabilir')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalWrapper title="Rezervasyon Yap" onClose={onClose}>
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: 'var(--danger)', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>Başlık</label>
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Toplantı başlığı" required
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', color: 'var(--text)' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>Başlangıç</label>
            <input type="datetime-local" value={form.startTime}
              onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>Bitiş</label>
            <input type="datetime-local" value={form.endTime}
              onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }} />
          </div>
        </div>
        {members.length > 0 && (
          <div style={{ background: 'var(--primary-light)', border: '1px solid #c7d2fe', borderRadius: 8, padding: '10px 14px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', marginBottom: 8 }}>
              Oda üyeleri otomatik davet edilecek:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {members.map(m => (
                <span key={m.id} style={{ fontSize: '0.75rem', background: 'white', border: '1px solid #c7d2fe', borderRadius: 100, padding: '3px 10px', color: 'var(--primary)' }}>
                  {m.userName}
                </span>
              ))}
            </div>
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
          <Button variant="secondary" type="button" onClick={onClose}>İptal</Button>
          <Button type="submit" loading={loading}>Rezerve Et</Button>
        </div>
      </form>
    </ModalWrapper>
  )
}

function AddMemberModal({ roomId, existingEmails, allUsers, onClose, onSuccess }) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [role, setRole] = useState('MEMBER')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const available = allUsers.filter(u =>
    !existingEmails.includes(u.email) &&
    (u.fullName.toLowerCase().includes(search.toLowerCase()) ||
     u.email.toLowerCase().includes(search.toLowerCase()))
  )

  const handleAdd = async () => {
    if (!selected) return
    setLoading(true)
    try {
      await api.addRoomMember(roomId, {
        userEmail: selected.email,
        userName: selected.fullName,
        memberRole: role,
      })
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Üye eklenemedi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalWrapper title="Üye Ekle" onClose={onClose}>
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: 'var(--danger)', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>
            Kullanıcı Ara
          </label>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="İsim veya email..."
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
        </div>

        <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8 }}>
          {available.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-3)', fontSize: '0.85rem' }}>
              Kullanıcı bulunamadı
            </div>
          ) : available.map(u => (
            <div key={u.id} onClick={() => setSelected(u)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
              cursor: 'pointer', borderBottom: '1px solid var(--border)',
              background: selected?.id === u.id ? 'var(--primary-light)' : 'transparent',
              transition: 'background 0.1s'
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 700, fontSize: '0.8rem'
              }}>
                {u.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: selected?.id === u.id ? 'var(--primary)' : 'var(--text)' }}>
                  {u.fullName}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{u.email}</div>
              </div>
              {selected?.id === u.id && (
                <div style={{ marginLeft: 'auto', color: 'var(--primary)', fontWeight: 700, fontSize: '0.8rem' }}>✓ Seçildi</div>
              )}
            </div>
          ))}
        </div>

        <div>
          <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>
            Rol
          </label>
          <select value={role} onChange={e => setRole(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.9rem', outline: 'none', color: 'var(--text)', background: 'var(--surface)' }}>
            <option value="MEMBER">Üye</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button variant="secondary" type="button" onClick={onClose}>İptal</Button>
          <Button loading={loading} onClick={handleAdd} disabled={!selected} icon={UserPlus}>
            Üye Ekle
          </Button>
        </div>
      </div>
    </ModalWrapper>
  )
}

function ModalWrapper({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', padding: 32, width: '100%', maxWidth: 500, border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)' }}>
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}