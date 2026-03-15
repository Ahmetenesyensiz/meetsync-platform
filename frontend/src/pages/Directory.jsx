import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../hooks/useApi'
import Card from '../components/Card'
import Badge from '../components/Badge'
import Input from '../components/Input'
import { Users, Search, Mail, Briefcase } from 'lucide-react'

const ROLE_MAP = {
  ADMIN: { label: 'Admin', variant: 'danger' },
  MANAGER: { label: 'Yönetici', variant: 'warning' },
  USER: { label: 'Kullanıcı', variant: 'default' },
}

export default function Directory() {
  const [search, setSearch] = useState('')

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.getUsers().then(r => r.data),
  })

  const filtered = users.filter(u =>
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.department || '').toLowerCase().includes(search.toLowerCase())
  )

  const byDept = filtered.reduce((acc, u) => {
    const dept = u.department || 'Diğer'
    if (!acc[dept]) acc[dept] = []
    acc[dept].push(u)
    return acc
  }, {})

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ 
          fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.5px', 
          display: 'flex', alignItems: 'center', gap: 10 
        }}>
          <Users size={24} color="var(--primary)" />
          Şirket Rehberi
        </h1>
        <p style={{ color: 'var(--text-3)', marginTop: 4 }}>
          {users.length} çalışan
        </p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <Input 
          placeholder="İsim, email veya departman ara..."
          icon={Search} 
          value={search}
          onChange={e => setSearch(e.target.value)} 
        />
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-3)' }}>
          Yükleniyor...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {Object.entries(byDept).map(([dept, deptUsers]) => (
            <div key={dept}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <Briefcase size={16} color="var(--text-3)" />
                <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-2)' }}>
                  {dept}
                </h2>
                <div style={{ height: 1, flex: 1, background: 'var(--border)' }} />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>
                  {deptUsers.length} kişi
                </span>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', 
                gap: 14 
              }}>
                {deptUsers.map(u => {
                  const role = ROLE_MAP[u.role] || ROLE_MAP.USER
                  const initials = u.fullName
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase()

                  return (
                    <Card key={u.id} style={{ padding: 18 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontWeight: 700, fontSize: '0.9rem'
                        }}>
                          {initials}
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 3 }}>
                            {u.fullName}
                          </div>
                          <div style={{ 
                            display: 'flex', alignItems: 'center', gap: 5, 
                            color: 'var(--text-3)', fontSize: '0.78rem', marginBottom: 6 
                          }}>
                            <Mail size={11} />
                            <span style={{ 
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' 
                            }}>
                              {u.email}
                            </span>
                          </div>
                          <Badge variant={role.variant}>{role.label}</Badge>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
