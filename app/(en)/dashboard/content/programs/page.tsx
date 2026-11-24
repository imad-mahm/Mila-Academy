'use client'

import { useMemo, useState } from 'react'
import { IconPlus, IconPencil, IconTrash, IconArrowUp, IconArrowDown, IconStarFilled, IconStar } from '@tabler/icons-react'
import {
  LEVELS, GENDERS, ageLabel, priceLabel, sessionsLabel,
  type Program, type Academy, type Level, type Gender,
} from '@/lib/programs'
import { useRequireAccess } from '../../hooks/useRequireAccess'
import { toast } from '../../components/toast'
import {
  api, useAdminData, PageHeader, Card, Button, TextField, SelectField, Toggle, ImageField, Modal,
  Loading, ErrorBanner, EmptyState, Badge, ViewSiteLink, confirmAction, GOLD,
} from '../../components/admin-ui'

const SPORT_COLOR: Record<Academy, string> = { football: '#16a34a', basketball: '#f97316' }

type Draft = {
  sport: Academy; name: string; subtitle: string; age_min: string; age_max: string
  level: Level; gender: Gender; price_month: string; sessions_per_week: string
  image_url: string; featured: boolean; active: boolean
}

const EMPTY: Draft = {
  sport: 'football', name: '', subtitle: '', age_min: '6', age_max: '8', level: 'Beginner',
  gender: 'Mixed', price_month: '50', sessions_per_week: '2', image_url: '', featured: false, active: true,
}

function toDraft(p: Program): Draft {
  return {
    sport: p.sport, name: p.name, subtitle: p.subtitle ?? '', age_min: String(p.age_min), age_max: String(p.age_max),
    level: p.level, gender: p.gender, price_month: String(p.price_month), sessions_per_week: String(p.sessions_per_week),
    image_url: p.image_url ?? '', featured: p.featured, active: p.active,
  }
}

function ProgramModal({
  initial, nextSort, onClose, onSaved,
}: { initial: Program | null; nextSort: number; onClose: () => void; onSaved: () => void }) {
  const [d, setD] = useState<Draft>(initial ? toDraft(initial) : EMPTY)
  const [openEnded, setOpenEnded] = useState(initial ? initial.age_max >= 50 : false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const set = <K extends keyof Draft>(k: K) => (v: Draft[K]) => setD(p => ({ ...p, [k]: v }))

  async function save() {
    setSaving(true)
    setError('')
    const body = {
      ...d,
      age_min: Number(d.age_min), age_max: openEnded ? 99 : Number(d.age_max),
      price_month: Number(d.price_month), sessions_per_week: Number(d.sessions_per_week),
    }
    try {
      if (initial) await api(`/api/admin/programs/${initial.id}`, { method: 'PATCH', json: body })
      else await api('/api/admin/programs', { method: 'POST', json: { ...body, sort_order: nextSort } })
      toast(initial ? 'Program updated' : 'Program added', 'success')
      onSaved()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      title={initial ? `Edit ${initial.name}` : 'Add program'}
      onClose={onClose}
      width={620}
      footer={<>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={save} disabled={saving || !d.name.trim()}>{saving ? 'Saving…' : 'Save'}</Button>
      </>}
    >
      {error && <ErrorBanner message={error} />}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))', gap: 14 }}>
        <SelectField label="Academy" value={d.sport} onChange={v => set('sport')(v as Academy)}
          options={[{ value: 'football', label: 'Football' }, { value: 'basketball', label: 'Basketball' }]} />
        <TextField label="Name" value={d.name} onChange={set('name')} placeholder="e.g. U12 Boys" required />
        <TextField label="Subtitle" value={d.subtitle} onChange={set('subtitle')} placeholder="e.g. Rising Stars" />
        <SelectField label="Level" value={d.level} onChange={v => set('level')(v as Level)} options={LEVELS.map(l => ({ value: l, label: l }))} />
        <SelectField label="Gender" value={d.gender} onChange={v => set('gender')(v as Gender)} options={GENDERS.map(g => ({ value: g, label: g }))} />
        <TextField label="Price per month ($)" type="number" value={d.price_month} onChange={set('price_month')} />
        <TextField label="Minimum age" type="number" value={d.age_min} onChange={set('age_min')} />
        {!openEnded && <TextField label="Maximum age" type="number" value={d.age_max} onChange={set('age_max')} />}
        <TextField label="Sessions per week" type="number" value={d.sessions_per_week} onChange={set('sessions_per_week')} />
      </div>
      <Toggle label="No upper age limit" help={`Shown as "Ages ${d.age_min || 0}+"`} checked={openEnded} onChange={setOpenEnded} />
      <ImageField label="Card photo" help="Optional. Shown at the top of the card on the academy page." folder="programs"
        value={d.image_url} onChange={set('image_url')} />
      <Toggle label="Show on homepage" help="Featured programs appear in the homepage “Our Programs” section." checked={d.featured} onChange={set('featured')} />
      <Toggle label="Visible on the website" help="Turn off to hide the program without deleting it." checked={d.active} onChange={set('active')} />
    </Modal>
  )
}

export default function ProgramsAdminPage() {
  const { user, loading: guardLoading } = useRequireAccess('website')
  const { data: programs, setData: setPrograms, loading, error, reload: load } =
    useAdminData<Program[]>('/api/admin/programs', !!user, [])
  const [filter, setFilter] = useState<'all' | Academy>('all')
  const [editing, setEditing] = useState<Program | null | 'new'>(null)


  const shown = useMemo(
    () => programs.filter(p => filter === 'all' || p.sport === filter),
    [programs, filter],
  )

  async function patch(p: Program, values: Partial<Program>, message?: string) {
    setPrograms(list => list.map(x => (x.id === p.id ? { ...x, ...values } : x)))
    try {
      await api(`/api/admin/programs/${p.id}`, { method: 'PATCH', json: values })
      if (message) toast(message, 'success')
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Update failed', 'error')
      load()
    }
  }

  // Swap display order with the neighbour in the current (filtered) list.
  async function move(p: Program, dir: -1 | 1) {
    const i = shown.findIndex(x => x.id === p.id)
    const other = shown[i + dir]
    if (!other) return
    const a = p.sort_order, b = other.sort_order === a ? a + dir : other.sort_order
    setPrograms(list =>
      list.map(x => (x.id === p.id ? { ...x, sort_order: b } : x.id === other.id ? { ...x, sort_order: a } : x))
        .sort((x, y) => x.sort_order - y.sort_order),
    )
    try {
      await Promise.all([
        api(`/api/admin/programs/${p.id}`, { method: 'PATCH', json: { sort_order: b } }),
        api(`/api/admin/programs/${other.id}`, { method: 'PATCH', json: { sort_order: a } }),
      ])
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Reorder failed', 'error')
      load()
    }
  }

  async function remove(p: Program) {
    if (!confirmAction(`Delete “${p.name}”? This cannot be undone. (To hide it instead, turn off “Visible”.)`)) return
    try {
      await api(`/api/admin/programs/${p.id}`, { method: 'DELETE' })
      setPrograms(list => list.filter(x => x.id !== p.id))
      toast('Program deleted', 'success')
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Delete failed', 'error')
    }
  }

  if (guardLoading || !user) return null

  return (
    <div>
      <PageHeader
        title="Programs"
        subtitle="The teams and classes listed on the /football and /basketball pages. Star a program to also show it on the homepage."
        actions={<>
          <ViewSiteLink href={filter === 'basketball' ? '/basketball' : '/football'} label="View academy page" />
          <Button onClick={() => setEditing('new')}><IconPlus size={15} /> Add program</Button>
        </>}
      />

      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {(['all', 'football', 'basketball'] as const).map(f => (
          <Button key={f} variant={filter === f ? 'primary' : 'secondary'} onClick={() => setFilter(f)} style={{ minHeight: 32, padding: '6px 14px' }}>
            {f === 'all' ? `All (${programs.length})` : `${f[0].toUpperCase()}${f.slice(1)} (${programs.filter(p => p.sport === f).length})`}
          </Button>
        ))}
      </div>

      {error && <ErrorBanner message={error} onRetry={load} />}

      {loading ? <Loading /> : shown.length === 0 ? (
        <EmptyState>No programs yet. Click “Add program” to create one.</EmptyState>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {shown.map((p, i) => (
            <Card key={p.id} style={{ padding: '12px 16px', opacity: p.active ? 1 : 0.55 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <button aria-label="Move up" disabled={i === 0} onClick={() => move(p, -1)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: i === 0 ? 'default' : 'pointer', opacity: i === 0 ? 0.3 : 1, padding: 2, display: 'flex', minWidth: 36, alignItems: 'center', justifyContent: 'center' }}>
                    <IconArrowUp size={15} />
                  </button>
                  <button aria-label="Move down" disabled={i === shown.length - 1} onClick={() => move(p, 1)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: i === shown.length - 1 ? 'default' : 'pointer', opacity: i === shown.length - 1 ? 0.3 : 1, padding: 2, display: 'flex', minWidth: 36, alignItems: 'center', justifyContent: 'center' }}>
                    <IconArrowDown size={15} />
                  </button>
                </div>

                <div style={{ flex: '1 1 220px', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 15 }}>{p.name}</span>
                    <Badge color={SPORT_COLOR[p.sport]}>{p.sport === 'football' ? 'Football' : 'Basketball'}</Badge>
                    {!p.active && <Badge color="#888888">Hidden</Badge>}
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 12, margin: '3px 0 0' }}>
                    {[p.subtitle, ageLabel(p), p.level, p.gender, sessionsLabel(p), priceLabel(p)].filter(Boolean).join(' · ')}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <Button
                    variant="ghost"
                    title={p.featured ? 'On the homepage — click to remove' : 'Not on the homepage — click to add'}
                    onClick={() => patch(p, { featured: !p.featured }, p.featured ? 'Removed from homepage' : 'Now on the homepage')}
                    style={{ color: p.featured ? GOLD : 'var(--text-muted)' }}
                  >
                    {p.featured ? <IconStarFilled size={16} /> : <IconStar size={16} />} Homepage
                  </Button>
                  <Toggle label="Visible" checked={p.active} onChange={v => patch(p, { active: v }, v ? 'Program visible' : 'Program hidden')} />
                  <Button variant="secondary" onClick={() => setEditing(p)}><IconPencil size={14} /> Edit</Button>
                  <Button variant="danger" onClick={() => remove(p)} title="Delete"><IconTrash size={14} /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editing && (
        <ProgramModal
          initial={editing === 'new' ? null : editing}
          nextSort={programs.reduce((m, p) => Math.max(m, p.sort_order), 0) + 1}
          onClose={() => setEditing(null)} onSaved={load} />
      )}
    </div>
  )
}
