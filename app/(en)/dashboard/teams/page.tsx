'use client'
// Team management. /api/admin/teams has had full CRUD since the dashboard
// migration but no screen to drive it, so the seeded example teams could not
// be renamed or removed and new ones had to be inserted by hand.

import { useMemo, useState } from 'react'
import { IconPlus, IconPencil, IconTrash, IconUsers } from '@tabler/icons-react'
import { useRequireAccess } from '../hooks/useRequireAccess'
import { toast } from '../components/toast'
import {
  api, useAdminData, confirmAction, PageHeader, Card, Grid, Button,
  Badge, EmptyState, Loading, ErrorBanner, Modal, TextField, SelectField,
} from '../components/admin-ui'
import { useCoaches } from '../coaches/data'
import type { StudentRow } from '../students/data'
import type { TeamRow } from '../students/api'

const ACADEMY_COLOR = { MFA: '#16a34a', MBA: '#f97316' } as const

type Draft = { name: string; academy: 'MFA' | 'MBA'; age_group: string; coach_id: string }

const BLANK: Draft = { name: '', academy: 'MFA', age_group: '', coach_id: '' }

function TeamFormModal({
  team, coaches, onSaved, onClose,
}: {
  team: TeamRow | null
  coaches: { id: string; name: string }[]
  onSaved: (verb: string, name: string) => void
  onClose: () => void
}) {
  const editing = team !== null
  const [draft, setDraft] = useState<Draft>(() => team
    ? { name: team.name, academy: team.academy, age_group: team.age_group ?? '', coach_id: team.coach_id ?? '' }
    : BLANK)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = <K extends keyof Draft>(k: K) => (v: Draft[K]) => setDraft(p => ({ ...p, [k]: v }))

  async function save() {
    const name = draft.name.trim()
    if (!name) { setError('Team name is required.'); return }

    // coach_id is a uuid foreign key — '' would be rejected, so "no head
    // coach" has to go across as null.
    const body = {
      name,
      academy: draft.academy,
      age_group: draft.age_group.trim(),
      coach_id: draft.coach_id === '' ? null : draft.coach_id,
    }

    setSaving(true)
    setError('')
    try {
      if (editing) await api(`/api/admin/teams/${team.id}`, { method: 'PATCH', json: body })
      else await api('/api/admin/teams', { method: 'POST', json: body })
      onSaved(editing ? 'updated' : 'created', name)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      title={editing ? 'Edit team' : 'New team'}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={() => void save()} disabled={saving}>
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Create team'}
          </Button>
        </>
      }
    >
      <TextField label="Team name" value={draft.name} onChange={set('name')} placeholder="e.g. MFA U-14" required />
      <SelectField
        label="Academy"
        value={draft.academy}
        onChange={v => set('academy')(v as 'MFA' | 'MBA')}
        options={[{ value: 'MFA', label: 'MFA — Football' }, { value: 'MBA', label: 'MBA — Basketball' }]}
      />
      <TextField label="Age group" value={draft.age_group} onChange={set('age_group')} placeholder="e.g. U-14" help="Optional — shown next to the team name." />
      <SelectField
        label="Head coach"
        value={draft.coach_id}
        onChange={set('coach_id')}
        help={coaches.length === 0 ? 'No coaches yet — add one under Coaches first.' : 'Optional.'}
        options={[{ value: '', label: '— None —' }, ...coaches.map(c => ({ value: c.id, label: c.name }))]}
      />
      {error && <p role="alert" style={{ color: '#f87171', fontSize: 13, margin: 0 }}>{error}</p>}
    </Modal>
  )
}

export default function TeamsPage() {
  const { user, loading: guardLoading } = useRequireAccess('teams')
  const enabled = !!user
  const isAdmin = user?.role === 'admin'

  const { data: teams, loading, error, reload } = useAdminData<TeamRow[]>('/api/admin/teams', enabled, [])
  const { data: students } = useAdminData<StudentRow[]>('/api/admin/students', enabled, [])
  const { coaches } = useCoaches()

  const [formFor, setFormFor] = useState<TeamRow | null>(null)
  const [showForm, setShowForm] = useState(false)

  const coachName = useMemo(() => {
    const byId = new Map(coaches.map(c => [c.id, c.name]))
    return (id: string | null) => (id ? byId.get(id) ?? 'Unknown coach' : null)
  }, [coaches])

  const countFor = useMemo(() => {
    const counts = new Map<string, number>()
    for (const s of students) {
      if (s.team_id) counts.set(s.team_id, (counts.get(s.team_id) ?? 0) + 1)
    }
    return (id: string) => counts.get(id) ?? 0
  }, [students])

  function onSaved(verb: string, name: string) {
    setShowForm(false)
    setFormFor(null)
    reload()
    toast(`${name} ${verb}`)
  }

  async function remove(team: TeamRow) {
    const n = countFor(team.id)
    const warning = n > 0
      ? `Delete ${team.name}? ${n} ${n === 1 ? 'student is' : 'students are'} assigned to it — they will be kept but left without a team.`
      : `Delete ${team.name}? This cannot be undone.`
    if (!confirmAction(warning)) return
    try {
      await api(`/api/admin/teams/${team.id}`, { method: 'DELETE' })
      reload()
      toast(`${team.name} deleted`)
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Could not delete team')
    }
  }

  if (guardLoading || !user) return null

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <PageHeader
        title="Teams"
        subtitle="The squads students and coaches are assigned to. Deleting a team leaves its students in place without a team rather than removing them."
        actions={isAdmin ? (
          <Button onClick={() => { setFormFor(null); setShowForm(true) }}>
            <IconPlus size={15} stroke={2.5} /> New team
          </Button>
        ) : undefined}
      />

      {error && <ErrorBanner message={error} onRetry={reload} />}

      {loading ? <Loading /> : teams.length === 0 ? (
        <EmptyState>
          {isAdmin ? 'No teams yet — create one to start assigning students and coaches.' : 'No teams yet.'}
        </EmptyState>
      ) : (
        <Grid min={280}>
          {teams.map(t => {
            const color = ACADEMY_COLOR[t.academy] ?? '#16a34a'
            const head = coachName(t.coach_id)
            const n = countFor(t.id)
            return (
              <Card key={t.id}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ color: 'var(--text-primary)', fontSize: 16, fontWeight: 700, margin: '0 0 6px' }}>{t.name}</p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <Badge color={color}>{t.academy}</Badge>
                      {t.age_group && <Badge color="#888888">{t.age_group}</Badge>}
                    </div>
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: 12, whiteSpace: 'nowrap', flexShrink: 0 }}>
                    <IconUsers size={14} /> {n}
                  </span>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '14px 0 0' }}>
                  {head ? <>Head coach · <span style={{ color: 'var(--text-primary)' }}>{head}</span></> : 'No head coach assigned'}
                </p>

                {isAdmin && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
                    <Button variant="secondary" onClick={() => { setFormFor(t); setShowForm(true) }}>
                      <IconPencil size={14} /> Edit
                    </Button>
                    <Button variant="danger" onClick={() => void remove(t)}>
                      <IconTrash size={14} /> Delete
                    </Button>
                  </div>
                )}
              </Card>
            )
          })}
        </Grid>
      )}

      {showForm && (
        <TeamFormModal
          team={formFor}
          coaches={coaches}
          onSaved={onSaved}
          onClose={() => { setShowForm(false); setFormFor(null) }}
        />
      )}
    </div>
  )
}
