'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { IconDeviceFloppy } from '@tabler/icons-react'
import { CONTENT_SECTIONS, CONTENT_DEFAULTS, type ContentField } from '@/lib/content-schema'
import { useRequireAccess } from '../hooks/useRequireAccess'
import { toast } from '../components/toast'
import {
  api, useAdminData, PageHeader, Card, Button, TextField, ImageField, Loading, ErrorBanner, ViewSiteLink, GOLD,
} from '../components/admin-ui'

type Values = Record<string, string>

const DEFAULTS = CONTENT_DEFAULTS as Values

// Every editable text and image on the public site, one form per section.
// The fields come from lib/content-schema.ts, so a field added there shows up
// here automatically.
export default function WebsiteContentPage() {
  const { user, loading: guardLoading } = useRequireAccess('website')

  const { data: saved, setData: setSaved, loading, error, reload } =
    useAdminData<Values>('/api/admin/settings', !!user, {})
  const [values,  setValues]  = useState<Values>(DEFAULTS)
  const [saving,  setSaving]  = useState(false)
  const [active,  setActive]  = useState<string>(CONTENT_SECTIONS[0].id)

  // Whenever the saved content changes (first load, reload, after a save),
  // reset the form to match it. Done while rendering rather than in an effect
  // so the form never paints with stale values.
  const [syncedFrom, setSyncedFrom] = useState(saved)
  if (syncedFrom !== saved) {
    setSyncedFrom(saved)
    setValues({ ...DEFAULTS, ...saved })
  }

  // What each field currently shows on the live site.
  const live = useCallback((key: string) => saved[key] ?? DEFAULTS[key], [saved])

  const dirtyKeys = useMemo(
    () => Object.keys(DEFAULTS).filter(k => values[k] !== live(k)),
    [values, live],
  )
  const dirty = new Set(dirtyKeys)

  // Warn before leaving with unsaved edits.
  useEffect(() => {
    if (dirtyKeys.length === 0) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => { e.preventDefault() }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirtyKeys.length])

  async function save() {
    if (dirtyKeys.length === 0) return
    setSaving(true)
    // A field put back to its default forgets the saved value (null), so a
    // future change to the default in code still reaches it.
    const body = Object.fromEntries(dirtyKeys.map(k => [k, values[k] === DEFAULTS[k] ? null : values[k]]))
    try {
      await api('/api/admin/settings', { method: 'PATCH', json: body })
      const next = { ...saved }
      for (const [k, v] of Object.entries(body)) {
        if (v === null) delete next[k]
        else next[k] = v
      }
      setSaved(next)
      toast(`Saved ${dirtyKeys.length} change${dirtyKeys.length === 1 ? '' : 's'} — live on the site now`, 'success')
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Save failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  function discard() {
    setValues({ ...DEFAULTS, ...saved })
  }

  if (guardLoading || !user) return null

  const section = CONTENT_SECTIONS.find(s => s.id === active) ?? CONTENT_SECTIONS[0]
  const set = (key: string) => (v: string) => setValues(p => ({ ...p, [key]: v }))

  function renderField(field: ContentField) {
    const isDirty = dirty.has(field.key)
    const canReset = values[field.key] !== field.default
    const extra = (
      <span style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
        {isDirty && <span style={{ color: GOLD, fontSize: 11, fontWeight: 700 }}>Unsaved</span>}
        {canReset && (
          <button
            type="button"
            onClick={() => set(field.key)(field.default)}
            title={field.default ? `Default: ${field.default}` : 'Default: empty'}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
          >
            Reset to default
          </button>
        )}
      </span>
    )
    if (field.type === 'image') {
      return <ImageField key={field.key} label={field.label} help={field.help} value={values[field.key]} onChange={set(field.key)} extra={extra} />
    }
    return (
      <TextField
        key={field.key}
        label={field.label}
        help={field.help}
        value={values[field.key]}
        onChange={set(field.key)}
        type={field.type === 'textarea' ? 'text' : field.type}
        multiline={field.type === 'textarea'}
        placeholder={field.default || undefined}
        extra={extra}
      />
    )
  }

  return (
    <div style={{ paddingBottom: dirtyKeys.length ? 80 : 0 }}>
      <style>{`
        .wc-layout { display: grid; grid-template-columns: 230px minmax(0, 1fr); gap: 20px; align-items: start; }
        .wc-nav { position: sticky; top: 80px; display: flex; flex-direction: column; gap: 2px; }
        @media (max-width: 900px) {
          .wc-layout { grid-template-columns: minmax(0, 1fr); }
          .wc-nav { position: static; flex-direction: row; overflow-x: auto; padding-bottom: 4px; }
          .wc-nav button { white-space: nowrap; }
        }
      `}</style>

      <PageHeader
        title="Site Content"
        subtitle="Edit any text or image on the public website. Changes go live as soon as you save. Use “Reset to default” to bring back the original wording."
        actions={<ViewSiteLink />}
      />

      {error && <ErrorBanner message={error} onRetry={reload} />}

      {loading ? <Loading /> : (
        <div className="wc-layout">
          <nav className="wc-nav" aria-label="Content sections">
            {CONTENT_SECTIONS.map(s => {
              const n = s.fields.filter(f => dirty.has(f.key)).length
              const on = s.id === active
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  style={{
                    textAlign: 'left', padding: '9px 12px', borderRadius: 8, fontSize: 13, fontFamily: 'inherit',
                    fontWeight: on ? 700 : 500, cursor: 'pointer',
                    border: 'none', borderLeft: `3px solid ${on ? GOLD : 'transparent'}`,
                    backgroundColor: on ? 'rgba(245,197,24,0.12)' : 'transparent',
                    color: on ? GOLD : 'var(--text-secondary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                  }}
                >
                  {s.title}
                  {n > 0 && <span style={{ fontSize: 10, fontWeight: 800, color: '#000', backgroundColor: GOLD, borderRadius: 10, padding: '1px 6px' }}>{n}</span>}
                </button>
              )
            })}
          </nav>

          <Card>
            <h2 style={{ color: 'var(--text-primary)', fontSize: 18, fontWeight: 700, margin: '0 0 4px' }}>{section.title}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '0 0 20px', lineHeight: 1.5 }}>{section.description}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {(section.fields as readonly ContentField[]).map(renderField)}
            </div>
          </Card>
        </div>
      )}

      {dirtyKeys.length > 0 && (
        <div style={{
          position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 900,
          backgroundColor: 'var(--bg-card)', border: `1px solid ${GOLD}66`, borderRadius: 12,
          boxShadow: '0 16px 40px rgba(0,0,0,0.45)', padding: '10px 12px 10px 18px',
          display: 'flex', alignItems: 'center', gap: 14, maxWidth: 'calc(100vw - 32px)', flexWrap: 'wrap',
        }}>
          <span style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 600 }}>
            {dirtyKeys.length} unsaved change{dirtyKeys.length === 1 ? '' : 's'}
          </span>
          <Button variant="ghost" onClick={discard} disabled={saving}>Discard</Button>
          <Button onClick={save} disabled={saving}>
            <IconDeviceFloppy size={15} /> {saving ? 'Saving…' : 'Save & publish'}
          </Button>
        </div>
      )}
    </div>
  )
}
