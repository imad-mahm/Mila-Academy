'use client'

import { useState } from 'react'
import { IconPlus, IconPencil, IconTrash, IconArrowUp, IconArrowDown, IconStarFilled } from '@tabler/icons-react'
import { useRequireAccess } from '../../hooks/useRequireAccess'
import { toast } from '../../components/toast'
import {
  api, useAdminData, PageHeader, Card, Button, TextField, SelectField, Modal,
  Loading, ErrorBanner, EmptyState, ViewSiteLink, confirmAction, Grid, GOLD,
} from '../../components/admin-ui'

interface TestimonialRow {
  id: string
  quote: string
  name: string
  initials: string
  role: string
  rating: number
  sort_order: number
}

function initialsOf(name: string) {
  return name.split(/\s+/).map(w => w[0] ?? '').join('').replace(/[^\p{L}]/gu, '').toUpperCase().slice(0, 2)
}

function TestimonialModal({
  initial, nextSort, onClose, onSaved,
}: { initial: TestimonialRow | null; nextSort: number; onClose: () => void; onSaved: () => void }) {
  const [quote, setQuote] = useState(initial?.quote ?? '')
  const [name, setName] = useState(initial?.name ?? '')
  const [role, setRole] = useState(initial?.role ?? '')
  const [rating, setRating] = useState(String(initial?.rating ?? 5))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function save() {
    setSaving(true)
    setError('')
    const body = { quote: quote.trim(), name: name.trim(), role: role.trim(), initials: initialsOf(name), rating: Number(rating) }
    try {
      if (initial) await api(`/api/admin/testimonials/${initial.id}`, { method: 'PATCH', json: body })
      else await api('/api/admin/testimonials', { method: 'POST', json: { ...body, sort_order: nextSort } })
      toast(initial ? 'Testimonial updated' : 'Testimonial added', 'success')
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
      title={initial ? 'Edit testimonial' : 'Add testimonial'}
      onClose={onClose}
      footer={<>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={save} disabled={saving || !quote.trim() || !name.trim()}>{saving ? 'Saving…' : 'Save'}</Button>
      </>}
    >
      {error && <ErrorBanner message={error} />}
      <TextField label="Quote" value={quote} onChange={setQuote} multiline rows={4} required />
      <TextField label="Name" value={name} onChange={setName} placeholder="e.g. Sara K." required />
      <TextField label="Who they are" value={role} onChange={setRole} placeholder="e.g. Parent of U12 player" />
      <SelectField label="Stars" value={rating} onChange={setRating}
        options={[5, 4, 3, 2, 1].map(n => ({ value: String(n), label: '★'.repeat(n) }))} />
    </Modal>
  )
}

export default function TestimonialsAdminPage() {
  const { user, loading: guardLoading } = useRequireAccess('website')
  const { data: rows, setData: setRows, loading, error, reload: load } =
    useAdminData<TestimonialRow[]>('/api/admin/testimonials', !!user, [])
  const [editing, setEditing] = useState<TestimonialRow | null | 'new'>(null)


  async function move(t: TestimonialRow, dir: -1 | 1) {
    const i = rows.findIndex(x => x.id === t.id)
    const other = rows[i + dir]
    if (!other) return
    const a = t.sort_order, b = other.sort_order === a ? a + dir : other.sort_order
    setRows(list =>
      list.map(x => (x.id === t.id ? { ...x, sort_order: b } : x.id === other.id ? { ...x, sort_order: a } : x))
        .sort((x, y) => x.sort_order - y.sort_order),
    )
    try {
      await Promise.all([
        api(`/api/admin/testimonials/${t.id}`, { method: 'PATCH', json: { sort_order: b } }),
        api(`/api/admin/testimonials/${other.id}`, { method: 'PATCH', json: { sort_order: a } }),
      ])
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Reorder failed', 'error')
      load()
    }
  }

  async function remove(t: TestimonialRow) {
    if (!confirmAction(`Delete the testimonial from ${t.name}?`)) return
    try {
      await api(`/api/admin/testimonials/${t.id}`, { method: 'DELETE' })
      setRows(list => list.filter(x => x.id !== t.id))
      toast('Testimonial deleted', 'success')
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Delete failed', 'error')
    }
  }

  if (guardLoading || !user) return null

  return (
    <div>
      <PageHeader
        title="Testimonials"
        subtitle="Quotes shown in the “What Families Say” carousel on the homepage, in this order. The section is hidden when there are none."
        actions={<>
          <ViewSiteLink />
          <Button onClick={() => setEditing('new')}><IconPlus size={15} /> Add testimonial</Button>
        </>}
      />

      {error && <ErrorBanner message={error} onRetry={load} />}

      {loading ? <Loading /> : rows.length === 0 ? (
        <EmptyState>No testimonials yet.</EmptyState>
      ) : (
        <Grid min={300}>
          {rows.map((t, i) => (
            <Card key={t.id} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 2, color: GOLD }}>
                {Array.from({ length: t.rating }).map((_, k) => <IconStarFilled key={k} size={13} />)}
              </div>
              <p style={{ color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.6, margin: 0, flex: 1 }}>“{t.quote}”</p>
              <div>
                <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 13, margin: 0 }}>{t.name}</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: 12, margin: '2px 0 0' }}>{t.role}</p>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <Button variant="ghost" onClick={() => move(t, -1)} disabled={i === 0} title="Move earlier"><IconArrowUp size={15} /></Button>
                <Button variant="ghost" onClick={() => move(t, 1)} disabled={i === rows.length - 1} title="Move later"><IconArrowDown size={15} /></Button>
                <span style={{ flex: 1 }} />
                <Button variant="secondary" onClick={() => setEditing(t)}><IconPencil size={14} /> Edit</Button>
                <Button variant="danger" onClick={() => remove(t)} title="Delete"><IconTrash size={14} /></Button>
              </div>
            </Card>
          ))}
        </Grid>
      )}

      {editing && (
        <TestimonialModal
          initial={editing === 'new' ? null : editing}
          nextSort={rows.reduce((m, r) => Math.max(m, r.sort_order), 0) + 1}
          onClose={() => setEditing(null)}
          onSaved={load}
        />
      )}
    </div>
  )
}
