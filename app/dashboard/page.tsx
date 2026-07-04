'use client'

import { useState, useEffect, useMemo } from 'react'
import { getCurrentUser, type AcademyFilter } from '@/lib/auth'
import { loadAllStudents } from './students/data'
import {
  IconBell,
  IconUsers,
  IconClipboardList,
  IconCash,
  IconAlertCircle,
  IconStarFilled,
  IconStar,
  IconMapPin,
  IconCalendar,
  IconChevronRight,
} from '@tabler/icons-react'

// ── Hardcoded data ─────────────────────────────────────────────────────────────

const STAT_CARD_META = [
  { label: 'Total Students',     Icon: IconUsers,         tint: 'rgba(22,163,74,0.12)',  iconColor: '#16a34a', border: 'rgba(22,163,74,0.2)'  },
  { label: 'Total Coaches',      Icon: IconClipboardList, tint: 'rgba(59,130,246,0.12)', iconColor: '#3b82f6', border: 'rgba(59,130,246,0.2)' },
  { label: 'Revenue This Month', Icon: IconCash,          tint: 'rgba(245,197,24,0.1)',  iconColor: '#f5c518', border: 'rgba(245,197,24,0.2)' },
  { label: 'Unpaid Students',    Icon: IconAlertCircle,   tint: 'rgba(239,68,68,0.1)',   iconColor: '#ef4444', border: 'rgba(239,68,68,0.2)' },
]

const COACH_COUNTS: Record<AcademyFilter, number> = { MFA: 3, MBA: 1, Both: 4 }

const ACADEMY_LABEL: Record<AcademyFilter, string> = {
  MFA: 'Mila Football Academy',
  MBA: 'Mila Basket Academy',
  Both: 'Mila Academy',
}

const ATTENDANCE = [
  { date: 'Jun 30',  team: 'MFA U-17', present: 13, absent: 2, rate: 87 },
  { date: 'Jun 29',  team: 'MBA U-16', present: 9,  absent: 4, rate: 69 },
  { date: 'Jun 28',  team: 'MFA U-14', present: 11, absent: 1, rate: 92 },
  { date: 'Jun 27',  team: 'MFA U-17', present: 10, absent: 3, rate: 77 },
  { date: 'Jun 26',  team: 'MBA U-16', present: 8,  absent: 5, rate: 62 },
]

const MATCHES = [
  { team: 'MFA U-17', opponent: 'Al-Nejmeh',   date: 'Jul 5',  location: 'Beirut Sports City', academy: 'MFA' as const },
  { team: 'MBA U-16', opponent: 'Safa BC',      date: 'Jul 8',  location: 'Brissour Sports Hall', academy: 'MBA' as const },
  { team: 'MFA U-14', opponent: 'Ansar FC',     date: 'Jul 12', location: 'Sidon Municipal Stadium', academy: 'MFA' as const },
]

const PAYMENTS = [
  { name: 'Ali Hassan',    amount: 150, date: 'Jun 30', status: 'paid'    as const },
  { name: 'Omar Khalil',   amount: 150, date: 'Jun 29', status: 'paid'    as const },
  { name: 'Sarah Mansour', amount: 150, date: 'Jun 28', status: 'unpaid'  as const },
  { name: 'Rami Fares',    amount: 150, date: 'Jun 28', status: 'paid'    as const },
  { name: 'Lara Haddad',   amount: 75,  date: 'Jun 27', status: 'partial' as const },
]

const TOP_PLAYERS = [
  { name: 'Karim Nassar',   team: 'MFA U-17', rating: 4.9 },
  { name: 'Youssef Aoun',   team: 'MFA U-14', rating: 4.7 },
  { name: 'Nour Saleh',     team: 'MBA U-16', rating: 4.6 },
]

// ── Helpers ────────────────────────────────────────────────────────────────────

function getGreeting(hour: number): string {
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function RateBar({ rate }: { rate: number }) {
  const color = rate >= 80 ? '#16a34a' : rate >= 60 ? '#f5c518' : '#ef4444'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 4, backgroundColor: '#2a2a2a', borderRadius: 2 }}>
        <div style={{ width: `${rate}%`, height: '100%', backgroundColor: color, borderRadius: 2, transition: 'width 0.4s ease' }} />
      </div>
      <span style={{ fontSize: 12, color, fontWeight: 600, minWidth: 32 }}>{rate}%</span>
    </div>
  )
}

function Stars({ rating }: { rating: number }) {
  const full  = Math.floor(rating)
  const empty = 5 - Math.ceil(rating)
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {Array.from({ length: full  }).map((_, i) => <IconStarFilled key={`f${i}`} size={13} style={{ color: '#f5c518' }} />)}
      {rating % 1 > 0                            && <IconStarFilled key="h" size={13} style={{ color: '#f5c518', opacity: 0.4 }} />}
      {Array.from({ length: empty }).map((_, i) => <IconStar       key={`e${i}`} size={13} style={{ color: '#444' }} />)}
    </span>
  )
}

const STATUS_STYLE: Record<'paid' | 'unpaid' | 'partial', { bg: string; color: string; label: string }> = {
  paid:    { bg: 'rgba(22,163,74,0.15)',  color: '#16a34a', label: 'Paid'    },
  unpaid:  { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', label: 'Unpaid'  },
  partial: { bg: 'rgba(245,197,24,0.15)',color: '#f5c518', label: 'Partial' },
}

const ACADEMY_BADGE: Record<'MFA' | 'MBA', { bg: string; color: string }> = {
  MFA: { bg: 'rgba(22,163,74,0.15)',  color: '#16a34a' },
  MBA: { bg: 'rgba(249,115,22,0.15)', color: '#f97316' },
}

// ── Card shell ─────────────────────────────────────────────────────────────────

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      backgroundColor: '#1a1a1a',
      border: '0.5px solid #2a2a2a',
      borderRadius: 12,
      ...style,
    }}>
      {children}
    </div>
  )
}

function SectionTitle({ title, linkLabel }: { title: string; linkLabel?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
      <h2 style={{ color: '#fff', fontSize: 15, fontWeight: 700, margin: 0 }}>{title}</h2>
      {linkLabel && (
        <a href="#" style={{ color: '#f5c518', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
          {linkLabel} <IconChevronRight size={14} />
        </a>
      )}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function DashboardHome() {
  const [name]     = useState(() => getCurrentUser()?.name ?? 'Coach')
  const [initials] = useState(() =>
    (name ?? 'C')
      .split(' ')
      .map((w: string) => w[0] ?? '')
      .join('')
      .toUpperCase()
      .slice(0, 2)
  )
  const [greeting] = useState(() => getGreeting(new Date().getHours()))
  const [dateStr]  = useState(() => new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  }))

  const [selectedAcademy, setSelectedAcademy] = useState<AcademyFilter>(
    () => getCurrentUser()?.selectedAcademy ?? 'Both'
  )
  useEffect(() => {
    function onAcademyChange() {
      const u = getCurrentUser()
      if (u) setSelectedAcademy(u.selectedAcademy)
    }
    window.addEventListener('mila_academy_changed', onAcademyChange)
    return () => window.removeEventListener('mila_academy_changed', onAcademyChange)
  }, [])

  const allStudents = useMemo(() => loadAllStudents(), [])
  const academyStudents = useMemo(
    () => selectedAcademy === 'Both' ? allStudents : allStudents.filter(s => s.academy === selectedAcademy),
    [allStudents, selectedAcademy]
  )
  const statValues = useMemo(() => {
    const revenue = academyStudents.filter(s => s.payment_status !== 'unpaid').reduce((sum, s) => sum + s.payment_amount, 0)
    const unpaid  = academyStudents.filter(s => s.payment_status === 'unpaid').length
    return [String(academyStudents.length), String(COACH_COUNTS[selectedAcademy]), `$${revenue.toLocaleString()}`, String(unpaid)]
  }, [academyStudents, selectedAcademy])

  const statCards = useMemo(() =>
    STAT_CARD_META.map((m, i) => ({ ...m, value: statValues[i] })),
    [statValues]
  )

  const filteredAttendance = useMemo(
    () => selectedAcademy === 'Both' ? ATTENDANCE : ATTENDANCE.filter(a => a.team.startsWith(selectedAcademy)),
    [selectedAcademy]
  )
  const filteredMatches = useMemo(
    () => selectedAcademy === 'Both' ? MATCHES : MATCHES.filter(m => m.academy === selectedAcademy),
    [selectedAcademy]
  )

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <style>{`
        .dash-stats  { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .dash-cols   { display: grid; grid-template-columns: 3fr 2fr;        gap: 20px; margin-top: 20px; }
        .dash-left   { display: flex; flex-direction: column; gap: 20px; }
        .dash-right  { display: flex; flex-direction: column; gap: 20px; }
        .att-table   { width: 100%; border-collapse: collapse; }
        .att-table th{ color: #555; font-size: 11px; font-weight: 600; letter-spacing: 1px;
                       text-transform: uppercase; padding: 0 0 10px; text-align: left; }
        .att-table td{ padding: 10px 0; border-top: 1px solid #222; font-size: 13px; color: #ccc; vertical-align: middle; }
        .att-table tr:first-child td { border-top: none; }
        @media (max-width: 900px) {
          .dash-stats { grid-template-columns: repeat(2, 1fr); }
          .dash-cols  { grid-template-columns: 1fr; }
        }
        @media (max-width: 500px) {
          .dash-stats { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 700, margin: '0 0 4px', lineHeight: 1.2 }}>
            {greeting}, {name} 👋
          </h1>
          <p style={{ color: '#f5c518', fontSize: 13, margin: '0 0 2px', letterSpacing: '0.3px' }}>
            {dateStr}
          </p>
          <p style={{ color: '#666', fontSize: 12, margin: 0 }}>
            {ACADEMY_LABEL[selectedAcademy]}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Bell */}
          <button style={{
            width: 40, height: 40, borderRadius: '50%',
            backgroundColor: '#1a1a1a', border: '0.5px solid #2a2a2a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#888', cursor: 'pointer', position: 'relative',
          }}>
            <IconBell size={18} stroke={1.8} />
            <span style={{
              position: 'absolute', top: 8, right: 8,
              width: 7, height: 7, borderRadius: '50%',
              backgroundColor: '#ef4444', border: '1.5px solid #1a1a1a',
            }} />
          </button>
          {/* Avatar */}
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            backgroundColor: 'rgba(245,197,24,0.15)',
            border: '1.5px solid rgba(245,197,24,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#f5c518', fontWeight: 700, fontSize: 13,
          }}>
            {initials}
          </div>
        </div>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────────────────── */}
      <div className="dash-stats">
        {statCards.map(({ label, value, Icon, tint, iconColor, border }) => (
          <Card key={label} style={{ padding: 20, position: 'relative', overflow: 'hidden' }}>
            {/* Tinted background blob */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundColor: tint,
              borderRadius: 12,
              pointerEvents: 'none',
            }} />
            {/* Icon — top right */}
            <div style={{
              position: 'absolute', top: 16, right: 16,
              width: 38, height: 38, borderRadius: 10,
              backgroundColor: `${iconColor}1a`,
              border: `1px solid ${border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: iconColor,
            }}>
              <Icon size={20} stroke={1.8} />
            </div>
            {/* Value */}
            <p style={{ color: '#fff', fontSize: 32, fontWeight: 700, margin: '0 0 4px', lineHeight: 1, position: 'relative' }}>
              {value}
            </p>
            <p style={{ color: '#666', fontSize: 13, margin: 0, position: 'relative' }}>
              {label}
            </p>
          </Card>
        ))}
      </div>

      {/* ── Main two-column content ──────────────────────────────────────────── */}
      <div className="dash-cols">

        {/* ── LEFT ────────────────────────────────────────────────────────── */}
        <div className="dash-left">

          {/* Recent Attendance */}
          <Card style={{ padding: '20px 24px' }}>
            <SectionTitle title="Recent Attendance" linkLabel="View all" />
            <table className="att-table">
              <thead>
                <tr>
                  <th style={{ width: 72 }}>Date</th>
                  <th>Team</th>
                  <th style={{ textAlign: 'center' }}>Present</th>
                  <th style={{ textAlign: 'center' }}>Absent</th>
                  <th style={{ width: 120 }}>Rate</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.map((row) => (
                  <tr key={row.date + row.team}>
                    <td style={{ color: '#777', fontSize: 12 }}>{row.date}</td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 600,
                        backgroundColor: row.team.startsWith('MFA') ? 'rgba(22,163,74,0.13)' : 'rgba(249,115,22,0.13)',
                        color:           row.team.startsWith('MFA') ? '#16a34a'               : '#f97316',
                      }}>
                        {row.team}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', color: '#16a34a', fontWeight: 600 }}>{row.present}</td>
                    <td style={{ textAlign: 'center', color: '#ef4444', fontWeight: 600 }}>{row.absent}</td>
                    <td><RateBar rate={row.rate} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Upcoming Matches */}
          <Card style={{ padding: '20px 24px' }}>
            <SectionTitle title="Upcoming Matches" linkLabel="View all" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filteredMatches.map((m) => {
                const badge = ACADEMY_BADGE[m.academy]
                return (
                  <div key={m.team + m.opponent} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    backgroundColor: '#111', border: '0.5px solid #222',
                    borderRadius: 10, padding: '12px 16px',
                  }}>
                    {/* Academy badge */}
                    <span style={{
                      flexShrink: 0,
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 700,
                      backgroundColor: badge.bg,
                      color: badge.color,
                      letterSpacing: '0.5px',
                    }}>
                      {m.academy}
                    </span>
                    {/* Teams */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: '0 0 3px' }}>
                        {m.team} <span style={{ color: '#555' }}>vs</span> {m.opponent}
                      </p>
                      <p style={{ color: '#555', fontSize: 12, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <IconCalendar size={12} stroke={1.8} style={{ flexShrink: 0 }} /> {m.date}
                        <span style={{ color: '#333' }}>·</span>
                        <IconMapPin size={12} stroke={1.8} style={{ flexShrink: 0 }} /> {m.location}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        {/* ── RIGHT ───────────────────────────────────────────────────────── */}
        <div className="dash-right">

          {/* Payment Overview */}
          <Card style={{ padding: '20px 24px' }}>
            <SectionTitle title="Payment Overview" />

            {/* Donut */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28, marginBottom: 20 }}>
              {/* CSS conic-gradient donut */}
              <div style={{ position: 'relative', width: 110, height: 110, flexShrink: 0 }}>
                <div style={{
                  width: 110, height: 110, borderRadius: '50%',
                  background: 'conic-gradient(#16a34a 0% 73%, #ef4444 73% 85%, #f5c518 85% 100%)',
                }} />
                {/* Inner cutout */}
                <div style={{
                  position: 'absolute', inset: '18px',
                  borderRadius: '50%',
                  backgroundColor: '#1a1a1a',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ color: '#fff', fontSize: 18, fontWeight: 700, lineHeight: 1 }}>73%</span>
                  <span style={{ color: '#666', fontSize: 10, marginTop: 2 }}>paid</span>
                </div>
              </div>
              {/* Legend */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Paid',    pct: '73%', color: '#16a34a' },
                  { label: 'Unpaid',  pct: '12%', color: '#ef4444' },
                  { label: 'Partial', pct: '15%', color: '#f5c518' },
                ].map(({ label, pct, color }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: color, flexShrink: 0 }} />
                    <span style={{ color: '#888', fontSize: 12 }}>{label}</span>
                    <span style={{ color: '#fff', fontSize: 12, fontWeight: 600, marginLeft: 'auto', paddingLeft: 12 }}>{pct}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent payments list */}
            <div style={{ borderTop: '1px solid #222', paddingTop: 16 }}>
              <p style={{ color: '#555', fontSize: 11, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', margin: '0 0 12px' }}>
                Recent Payments
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {PAYMENTS.map((p) => {
                  const s = STATUS_STYLE[p.status]
                  return (
                    <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {/* Initials dot */}
                      <div style={{
                        width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                        backgroundColor: '#222', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', color: '#777', fontSize: 11, fontWeight: 700,
                      }}>
                        {p.name.split(' ').map(w => w[0]).join('')}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ color: '#ddd', fontSize: 13, fontWeight: 500, margin: '0 0 1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p.name}
                        </p>
                        <p style={{ color: '#555', fontSize: 11, margin: 0 }}>{p.date}</p>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: '0 0 2px' }}>${p.amount}</p>
                        <span style={{
                          display: 'inline-block',
                          padding: '1px 7px', borderRadius: 20,
                          fontSize: 10, fontWeight: 700,
                          backgroundColor: s.bg, color: s.color,
                        }}>
                          {s.label}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </Card>

          {/* Top Rated Players */}
          <Card style={{ padding: '20px 24px' }}>
            <SectionTitle title="Top Rated Players" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {TOP_PLAYERS.map((p, i) => (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {/* Rank */}
                  <span style={{
                    width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                    backgroundColor: i === 0 ? 'rgba(245,197,24,0.2)' : i === 1 ? 'rgba(180,180,180,0.1)' : 'rgba(180,100,40,0.1)',
                    color:           i === 0 ? '#f5c518'               : i === 1 ? '#aaa'                   : '#cd7f32',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800,
                  }}>
                    {i + 1}
                  </span>
                  {/* Name + team */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: '0 0 2px' }}>{p.name}</p>
                    <p style={{ color: '#555', fontSize: 11, margin: 0 }}>{p.team}</p>
                  </div>
                  {/* Rating */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <Stars rating={p.rating} />
                    <p style={{ color: '#f5c518', fontSize: 12, fontWeight: 700, margin: '2px 0 0', textAlign: 'center' }}>
                      {p.rating.toFixed(1)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>
      </div>
    </div>
  )
}
