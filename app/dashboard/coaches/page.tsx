'use client'

import { useState, useMemo, useEffect } from 'react'
import { IconPlus, IconX } from '@tabler/icons-react'
import { TEAMS, teamName } from '../students/data'
import { toast } from '../components/toast'
import { useRequireAccess } from '../hooks/useRequireAccess'

// ── Types ──────────────────────────────────────────────────────────────────────

interface CoachRow {
  id: string
  name: string
  session_name: string  // matches attendance records e.g. 'Coach Nader'
  specialty: string
  teams: string[]
  experience: number
  bio: string
  phone: string
  email: string
  nationality: string
  certifications: string[]
  languages: string[]
  joined: string
  salary: string
  contract_end: string
  added?: boolean
}

interface SessionRecord {
  id: string; date: string; team_id: string; team_name: string
  coach: string; records: Record<string, string>
  student_names: Record<string, string>; saved_at: string
}

// ── Static coach data ──────────────────────────────────────────────────────────

const BASE_COACHES: CoachRow[] = [
  {
    id: 'coach-1', name: 'Ahmad Nader', session_name: 'Coach Nader',
    specialty: 'Attack & Finishing', teams: ['mfa-u17'], experience: 8,
    bio: 'Former professional midfielder in the Lebanese Premier League. Joined Mila in 2019. Known for high-intensity attack drills and exceptional finishing technique training.',
    phone: '+961 70 100 200', email: 'ahmad.nader@milaacademy.com',
    nationality: 'Lebanese',
    certifications: ['UEFA B License', 'LFF Level 2 Coaching Certificate'],
    languages: ['Arabic', 'French', 'English'],
    joined: '2019-09-01', salary: '$1,400/month', contract_end: '2027-06-30',
  },
  {
    id: 'coach-2', name: 'Bilal Akar', session_name: 'Coach Bilal',
    specialty: 'Youth Development', teams: ['mfa-u14'], experience: 5,
    bio: 'Specialist in youth football development with a degree in Sports Science from LAU. Focuses on building fundamental skills and tactical awareness in younger age groups.',
    phone: '+961 76 200 300', email: 'bilal.akar@milaacademy.com',
    nationality: 'Lebanese',
    certifications: ['LFF Level 1 Coaching Certificate', 'FIFA Grassroots Certificate'],
    languages: ['Arabic', 'English'],
    joined: '2021-01-15', salary: '$1,100/month', contract_end: '2026-12-31',
  },
  {
    id: 'coach-3', name: 'Samer Khalil', session_name: 'Coach Samer',
    specialty: 'Basketball — Guard Play', teams: ['mba-u16'], experience: 3,
    bio: 'Former FIBA referee turned coach. Deep knowledge of basketball rules and mechanics. Specialises in guard play, dribbling circuits, and team coordination.',
    phone: '+961 70 300 400', email: 'samer.khalil@milaacademy.com',
    nationality: 'Lebanese',
    certifications: ['FIBA Level 1 Coach', 'Lebanese Basketball Federation Certificate'],
    languages: ['Arabic', 'English', 'Spanish'],
    joined: '2023-09-01', salary: '$1,000/month', contract_end: '2026-08-31',
  },
  {
    id: 'coach-4', name: 'Nadia Frem', session_name: 'Coach Nadia',
    specialty: 'Fitness & Conditioning', teams: ['mfa-u17', 'mfa-u14'], experience: 6,
    bio: 'Certified sports physiotherapist and strength coach. Works with all MFA teams on conditioning, injury prevention, and athletic performance optimisation.',
    phone: '+961 71 400 500', email: 'nadia.frem@milaacademy.com',
    nationality: 'Lebanese',
    certifications: ['NSCA Certified Strength Coach', 'Sports Physiotherapy Certificate'],
    languages: ['Arabic', 'French'],
    joined: '2020-03-01', salary: '$1,200/month', contract_end: '2027-03-31',
  },
]

// ── Helpers ────────────────────────────────────────────────────────────────────

function initials(n: string) { return n.split(' ').map(w => w[0] ?? '').join('').toUpperCase().slice(0, 2) }
function acColor(tid: string) { return TEAMS.find(t => t.id === tid)?.academy === 'MBA' ? '#f97316' : '#16a34a' }
function expColor(y: number) { return y >= 7 ? '#f5c518' : y >= 4 ? '#16a34a' : '#3b82f6' }

const FIELD: React.CSSProperties = {
  width: '100%', backgroundColor: '#111', border: '0.5px solid #333', borderRadius: 8,
  color: '#ccc', fontSize: 13, padding: '10px 12px', outline: 'none', boxSizing: 'border-box',
}
const LBL: React.CSSProperties = { color: '#888', fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', display: 'block', marginBottom: 5 }

// ── Add Coach Modal ───────────────────────────────────────────────────────────

function AddCoachModal({ userRole, onSave, onClose }: { userRole: string; onSave: (c: CoachRow) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    name: '', specialty: '', experience: '1', bio: '',
    phone: '', email: '', nationality: 'Lebanese',
    certifications: '', languages: 'Arabic',
    joined: new Date().toISOString().split('T')[0],
    salary: '', contract_end: '',
    teams: [] as string[],
  })
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))
  const toggleTeam = (id: string) => setForm(p => ({
    ...p,
    teams: p.teams.includes(id) ? p.teams.filter(t => t !== id) : [...p.teams, id],
  }))

  function save() {
    if (!form.name.trim()) return
    const c: CoachRow = {
      id: `coach-${Date.now()}`, name: form.name.trim(),
      session_name: `Coach ${form.name.trim().split(' ').pop() ?? form.name}`,
      specialty: form.specialty, teams: form.teams, experience: Number(form.experience),
      bio: form.bio, phone: form.phone, email: form.email, nationality: form.nationality,
      certifications: form.certifications.split(',').map(s => s.trim()).filter(Boolean),
      languages: form.languages.split(',').map(s => s.trim()).filter(Boolean),
      joined: form.joined, salary: form.salary, contract_end: form.contract_end, added: true,
    }
    onSave(c)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ backgroundColor: '#1a1a1a', border: '0.5px solid #2a2a2a', borderRadius: 16, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: 0 }}>Add Coach</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer' }}><IconX size={20} /></button>
        </div>

        <div style={{ display: 'grid', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={LBL}>FULL NAME *</label><input style={FIELD} value={form.name} onChange={e => set('name', e.target.value)} /></div>
            <div><label style={LBL}>SPECIALTY</label><input style={FIELD} value={form.specialty} onChange={e => set('specialty', e.target.value)} placeholder="e.g. Attack & Finishing" /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={LBL}>YEARS EXPERIENCE</label><input type="number" min="0" max="40" style={FIELD} value={form.experience} onChange={e => set('experience', e.target.value)} /></div>
            <div><label style={LBL}>NATIONALITY</label><input style={FIELD} value={form.nationality} onChange={e => set('nationality', e.target.value)} /></div>
          </div>

          <div>
            <label style={LBL}>ASSIGNED TEAMS</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {TEAMS.map(t => (
                <button key={t.id} onClick={() => toggleTeam(t.id)} style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  border: `1.5px solid ${form.teams.includes(t.id) ? acColor(t.id) : '#2a2a2a'}`,
                  backgroundColor: form.teams.includes(t.id) ? `${acColor(t.id)}22` : '#111',
                  color: form.teams.includes(t.id) ? acColor(t.id) : '#555',
                }}>{t.name}</button>
              ))}
            </div>
          </div>

          <div><label style={LBL}>BIO</label><textarea rows={3} style={{ ...FIELD, resize: 'vertical' }} value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Brief coach biography…" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={LBL}>PHONE</label><input style={FIELD} value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
            <div><label style={LBL}>EMAIL</label><input style={FIELD} value={form.email} onChange={e => set('email', e.target.value)} /></div>
          </div>
          <div><label style={LBL}>CERTIFICATIONS (comma-separated)</label><input style={FIELD} value={form.certifications} onChange={e => set('certifications', e.target.value)} placeholder="UEFA B License, FIFA Grassroots…" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={LBL}>LANGUAGES (comma-separated)</label><input style={FIELD} value={form.languages} onChange={e => set('languages', e.target.value)} /></div>
            <div><label style={LBL}>DATE JOINED</label><input type="date" style={{ ...FIELD, colorScheme: 'dark' }} value={form.joined} onChange={e => set('joined', e.target.value)} /></div>
          </div>

          {userRole === 'admin' && (
            <div style={{ padding: '14px', backgroundColor: 'rgba(245,197,24,0.05)', border: '0.5px solid rgba(245,197,24,0.15)', borderRadius: 10 }}>
              <p style={{ color: '#f5c518', fontSize: 11, fontWeight: 700, margin: '0 0 12px', letterSpacing: '0.5px' }}>🔒 ADMIN ONLY</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={LBL}>SALARY</label><input style={FIELD} value={form.salary} onChange={e => set('salary', e.target.value)} placeholder="e.g. $1,200/month" /></div>
                <div><label style={LBL}>CONTRACT END</label><input type="date" style={{ ...FIELD, colorScheme: 'dark' }} value={form.contract_end} onChange={e => set('contract_end', e.target.value)} /></div>
              </div>
            </div>
          )}

          <button onClick={save} style={{ width: '100%', padding: '12px 0', borderRadius: 10, fontSize: 14, fontWeight: 700, backgroundColor: '#16a34a', color: '#fff', border: 'none', cursor: 'pointer' }}>
            Add Coach
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Coach Detail Modal ────────────────────────────────────────────────────────

const TABS = ['Profile', 'Teams', 'Session Log', 'Private Info'] as const
type Tab = typeof TABS[number]

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 16, padding: '10px 0', borderBottom: '1px solid #1e1e1e' }}>
      <span style={{ color: '#555', fontSize: 12, fontWeight: 600, minWidth: 130 }}>{label}</span>
      <span style={{ color: '#ccc', fontSize: 13 }}>{value || '—'}</span>
    </div>
  )
}

function CoachDetailModal({ coach, userRole, onClose }: { coach: CoachRow; userRole: string; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>('Profile')
  const sessions = useMemo<SessionRecord[]>(() => {
    try {
      const all: SessionRecord[] = JSON.parse(localStorage.getItem('mila_attendance_sessions') ?? '[]')
      // include dummy sessions too
      const DUMMY_IDS = ['ds-1','ds-2','ds-3','ds-4','ds-5','ds-6','ds-7','ds-8','ds-9','ds-10']
      return all.filter(s => s.coach === coach.session_name || DUMMY_IDS.includes(s.id) && s.coach === coach.session_name)
    } catch {
      return []
    }
  }, [coach.session_name])

  const col = '#f5c518'

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ backgroundColor: '#1a1a1a', border: '0.5px solid #2a2a2a', borderRadius: 16, width: '100%', maxWidth: 620, maxHeight: '90vh', overflowY: 'auto', padding: 28 }}>
        {/* Header */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 24 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', flexShrink: 0, backgroundColor: 'rgba(245,197,24,0.12)', border: '2px solid rgba(245,197,24,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: col, fontSize: 22, fontWeight: 800 }}>
            {initials(coach.name)}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: '0 0 4px' }}>{coach.name}</h2>
            <p style={{ color: '#888', fontSize: 13, margin: '0 0 8px' }}>{coach.specialty}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {coach.teams.map(tid => (
                <span key={tid} style={{ backgroundColor: `${acColor(tid)}22`, color: acColor(tid), fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>{teamName(tid)}</span>
              ))}
              <span style={{ backgroundColor: 'rgba(245,197,24,0.1)', color: '#f5c518', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>{coach.experience}y exp</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', flexShrink: 0 }}><IconX size={20} /></button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2, backgroundColor: '#111', borderRadius: 10, padding: 4, marginBottom: 20 }}>
          {TABS.filter(t => t !== 'Private Info' || userRole === 'admin').map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '7px 0', borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none',
              backgroundColor: tab === t ? '#1a1a1a' : 'transparent',
              color: tab === t ? '#fff' : '#555',
            }}>{t}</button>
          ))}
        </div>

        {/* Profile */}
        {tab === 'Profile' && (
          <div>
            {coach.bio && <p style={{ color: '#aaa', fontSize: 13, lineHeight: 1.7, marginBottom: 16, padding: '12px 14px', backgroundColor: '#111', borderRadius: 8 }}>{coach.bio}</p>}
            <InfoRow label="Nationality" value={coach.nationality} />
            <InfoRow label="Email" value={coach.email} />
            <InfoRow label="Date Joined" value={coach.joined} />
            <InfoRow label="Languages" value={coach.languages.join(', ')} />
            <div style={{ padding: '10px 0' }}>
              <span style={{ color: '#555', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 8 }}>CERTIFICATIONS</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {coach.certifications.map((c, i) => (
                  <span key={i} style={{ backgroundColor: 'rgba(59,130,246,0.1)', border: '0.5px solid rgba(59,130,246,0.25)', color: '#3b82f6', fontSize: 11, padding: '3px 10px', borderRadius: 20 }}>{c}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Teams */}
        {tab === 'Teams' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {coach.teams.length === 0 ? (
              <p style={{ color: '#555', fontSize: 13 }}>No teams assigned.</p>
            ) : coach.teams.map(tid => (
              <div key={tid} style={{ padding: '16px 18px', backgroundColor: '#111', borderRadius: 10, border: `0.5px solid ${acColor(tid)}33` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: `${acColor(tid)}22`, border: `1.5px solid ${acColor(tid)}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: acColor(tid), fontSize: 9, fontWeight: 800, textAlign: 'center', lineHeight: 1.3 }}>
                    {teamName(tid).replace(' ', '\n')}
                  </div>
                  <div>
                    <p style={{ color: '#fff', fontSize: 14, fontWeight: 700, margin: 0 }}>{teamName(tid)}</p>
                    <p style={{ color: '#555', fontSize: 12, margin: 0 }}>{TEAMS.find(t => t.id === tid)?.academy} Academy</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Session Log */}
        {tab === 'Session Log' && (
          <div>
            {sessions.length === 0 ? (
              <p style={{ color: '#555', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>No sessions recorded for this coach yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {sessions.map((s, i) => {
                  const vals = Object.values(s.records) as string[]
                  const present = vals.filter(v => v === 'present').length
                  const rate = vals.length > 0 ? Math.round((vals.filter(v => v !== 'absent').length / vals.length) * 100) : 0
                  return (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', borderTop: i > 0 ? '1px solid #1e1e1e' : 'none', flexWrap: 'wrap', gap: 8 }}>
                      <div>
                        <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: 0 }}>{s.date} · {s.team_name}</p>
                        <p style={{ color: '#555', fontSize: 11, margin: 0 }}>{vals.length} students</p>
                      </div>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <span style={{ color: '#16a34a', fontSize: 12, fontWeight: 600 }}>{present} present</span>
                        <span style={{ color: rate >= 80 ? '#16a34a' : rate >= 60 ? '#f5c518' : '#ef4444', fontSize: 13, fontWeight: 700 }}>{rate}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Private Info (admin only) */}
        {tab === 'Private Info' && userRole === 'admin' && (
          <div style={{ padding: '16px', backgroundColor: 'rgba(245,197,24,0.04)', border: '0.5px solid rgba(245,197,24,0.15)', borderRadius: 10 }}>
            <p style={{ color: '#f5c518', fontSize: 11, fontWeight: 700, margin: '0 0 14px', letterSpacing: '0.5px' }}>🔒 CONFIDENTIAL — ADMIN VIEW ONLY</p>
            <InfoRow label="Personal Phone" value={coach.phone} />
            <InfoRow label="Monthly Salary" value={coach.salary} />
            <InfoRow label="Contract End Date" value={coach.contract_end} />
          </div>
        )}
      </div>
    </div>
  )
}

// ── Coach Card ────────────────────────────────────────────────────────────────

function CoachCard({ coach, onClick }: { coach: CoachRow; onClick: () => void }) {
  const [hov, setHov] = useState(false)
  const col = '#f5c518'

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        backgroundColor: '#1a1a1a',
        border: `0.5px solid ${hov ? 'rgba(245,197,24,0.3)' : '#2a2a2a'}`,
        borderRadius: 14, padding: 22, cursor: 'pointer',
        transition: 'all 0.2s ease',
        transform: hov ? 'translateY(-2px)' : 'none',
        boxShadow: hov ? '0 8px 24px rgba(0,0,0,0.3)' : 'none',
      }}
    >
      {/* Avatar + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', flexShrink: 0, backgroundColor: 'rgba(245,197,24,0.1)', border: '2px solid rgba(245,197,24,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: col, fontSize: 17, fontWeight: 800 }}>
          {initials(coach.name)}
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ color: '#fff', fontSize: 15, fontWeight: 700, margin: '0 0 3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{coach.name}</p>
          <p style={{ color: '#888', fontSize: 12, margin: 0 }}>{coach.specialty}</p>
        </div>
      </div>

      {/* Teams */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
        {coach.teams.map(tid => (
          <span key={tid} style={{ backgroundColor: `${acColor(tid)}18`, color: acColor(tid), fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 20 }}>{teamName(tid)}</span>
        ))}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid #222' }}>
        <span style={{ color: '#555', fontSize: 12 }}>Since {new Date(coach.joined).getFullYear()}</span>
        <span style={{ backgroundColor: `${expColor(coach.experience)}1a`, color: expColor(coach.experience), fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20 }}>
          {coach.experience}y exp
        </span>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function CoachesPage() {
  const { user: authUser, loading: authLoading } = useRequireAccess('coaches')

  const [selectedAcademy, setSelectedAcademy] = useState<'MFA' | 'MBA' | 'Both'>(() => {
    try {
      const u = JSON.parse(localStorage.getItem('mila_user') ?? '{}')
      return (u.selectedAcademy ?? 'Both') as 'MFA' | 'MBA' | 'Both'
    } catch { return 'Both' }
  })
  useEffect(() => {
    function onAcademyChange() {
      try {
        const u = JSON.parse(localStorage.getItem('mila_user') ?? '{}')
        setSelectedAcademy((u.selectedAcademy ?? 'Both') as 'MFA' | 'MBA' | 'Both')
      } catch {}
    }
    window.addEventListener('mila_academy_changed', onAcademyChange)
    return () => window.removeEventListener('mila_academy_changed', onAcademyChange)
  }, [])

  const [coaches,    setCoaches]    = useState<CoachRow[]>(() => {
    try {
      const added: CoachRow[] = JSON.parse(localStorage.getItem('mila_coaches_added') ?? '[]')
      return added.length ? [...BASE_COACHES, ...added] : BASE_COACHES
    } catch {
      return BASE_COACHES
    }
  })
  const [userRole]   = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem('mila_user') ?? '{}')
      return u.role || 'admin'
    } catch {
      return 'admin'
    }
  })
  const [selected,   setSelected]   = useState<CoachRow | null>(null)
  const [showAdd,    setShowAdd]    = useState(false)
  const [search,     setSearch]     = useState('')
  const [filterTeam, setFilterTeam] = useState('All')

  function saveCoach(c: CoachRow) {
    const updated = [...coaches, c]
    setCoaches(updated)
    const added = updated.filter(x => x.added)
    try { localStorage.setItem('mila_coaches_added', JSON.stringify(added)) } catch {}
    setShowAdd(false)
    toast(`${c.name} added successfully`)
  }

  const filtered = useMemo(() => coaches.filter(c => {
    if (selectedAcademy !== 'Both') {
      const coachAcademies = c.teams.map(tid => TEAMS.find(t => t.id === tid)?.academy)
      if (!coachAcademies.includes(selectedAcademy)) return false
    }
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.specialty.toLowerCase().includes(search.toLowerCase())) return false
    if (filterTeam !== 'All' && !c.teams.includes(filterTeam)) return false
    return true
  }), [coaches, search, filterTeam, selectedAcademy])

  const SEL: React.CSSProperties = {
    backgroundColor: '#1a1a1a', border: '0.5px solid #2a2a2a', borderRadius: 8,
    color: '#ccc', fontSize: 13, padding: '9px 32px 9px 12px', outline: 'none',
    appearance: 'none', cursor: 'pointer',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23666' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 010 1.659l-4.796 5.48a1 1 0 01-1.506 0z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', backgroundSize: '11px',
  }

  if (authLoading || !authUser) return null
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <style>{`
        .coaches-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
        @media (max-width: 900px) { .coaches-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 580px) { .coaches-grid { grid-template-columns: 1fr; } }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 700, margin: '0 0 4px' }}>Coaches</h1>
          <p style={{ color: '#555', fontSize: 14, margin: 0 }}>{coaches.length} coaches across {TEAMS.length} teams</p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          <IconPlus size={16} stroke={2.5} /> Add Coach
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 22, flexWrap: 'wrap' }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search coaches…"
          style={{ ...FIELD, maxWidth: 220, padding: '9px 12px', backgroundColor: '#1a1a1a', border: '0.5px solid #2a2a2a', borderRadius: 8, color: '#ccc', fontSize: 13, outline: 'none' }}
        />
        <select value={filterTeam} onChange={e => setFilterTeam(e.target.value)} style={SEL}>
          <option value="All">All Teams</option>
          {TEAMS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {/* Grid */}
      <div className="coaches-grid">
        {filtered.map(c => (
          <CoachCard key={c.id} coach={c} onClick={() => setSelected(c)} />
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px 0', color: '#555', fontSize: 14 }}>
            No coaches match your search.
          </div>
        )}
      </div>

      {selected && <CoachDetailModal coach={selected} userRole={userRole} onClose={() => setSelected(null)} />}
      {showAdd   && <AddCoachModal userRole={userRole} onSave={saveCoach} onClose={() => setShowAdd(false)} />}
    </div>
  )
}
