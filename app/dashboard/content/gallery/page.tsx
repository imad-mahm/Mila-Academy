'use client'

import { useRef, useState } from 'react'
import { IconUpload, IconPencil, IconTrash } from '@tabler/icons-react'
import { useRequireAccess } from '../../hooks/useRequireAccess'
import { toast } from '../../components/toast'
import {
  api, useAdminData, PageHeader, Card, Button, TextField, SelectField, Modal,
  Loading, ErrorBanner, EmptyState, Badge, ViewSiteLink, confirmAction, Grid,
} from '../../components/admin-ui'

type Category = 'football' | 'basketball' | 'events'

interface Photo {
  id: string
  image_url: string
  category: Category
  caption: string
  sort_order: number
}

const CATEGORIES: { value: Category; label: string; color: string }[] = [
  { value: 'football',   label: 'Football',   color: '#16a34a' },
  { value: 'basketball', label: 'Basketball', color: '#f97316' },
  { value: 'events',     label: 'Events',     color: '#3b82f6' },
]

function EditPhotoModal({ photo, onClose, onSaved }: { photo: Photo; onClose: () => void; onSaved: (p: Photo) => void }) {
  const [caption, setCaption] = useState(photo.caption)
  const [category, setCategory] = useState<Category>(photo.category)
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    try {
      const { data } = await api<{ data: Photo }>(`/api/admin/gallery/${photo.id}`, { method: 'PATCH', json: { caption, category } })
      toast('Photo updated', 'success')
      onSaved(data)
      onClose()
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Save failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title="Edit photo" onClose={onClose} footer={<>
      <Button variant="secondary" onClick={onClose}>Cancel</Button>
      <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
    </>}>
      {/* eslint-disable-next-line @next/next/no-img-element -- storage URL preview */}
      <img src={photo.image_url} alt="" style={{ width: '100%', maxHeight: 280, objectFit: 'contain', borderRadius: 8, backgroundColor: 'var(--bg)' }} />
      <TextField label="Caption" value={caption} onChange={setCaption} help="Shown when a visitor hovers or opens the photo." />
      <SelectField label="Category" value={category} onChange={v => setCategory(v as Category)} options={CATEGORIES} />
    </Modal>
  )
}

export default function GalleryAdminPage() {
  const { user, loading: guardLoading } = useRequireAccess('website')
  const { data: photos, setData: setPhotos, loading, error, reload: load } =
    useAdminData<Photo[]>('/api/admin/gallery', !!user, [])
  const [editing, setEditing] = useState<Photo | null>(null)

  const [category, setCategory] = useState<Category>('football')
  const [caption, setCaption] = useState('')
  const [uploading, setUploading] = useState<{ done: number; total: number } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)


  async function upload(files: FileList | null) {
    if (!files || files.length === 0) return
    const list = Array.from(files)
    let sort = photos.reduce((m, p) => Math.max(m, p.sort_order), 0)
    let failed = 0
    setUploading({ done: 0, total: list.length })
    for (const [i, file] of list.entries()) {
      const form = new FormData()
      form.append('file', file)
      form.append('category', category)
      form.append('caption', caption)
      form.append('sort_order', String(++sort))
      try {
        const { data } = await api<{ data: Photo }>('/api/admin/gallery/upload', { method: 'POST', body: form })
        setPhotos(p => [...p, data])
      } catch (e) {
        failed++
        toast(`${file.name}: ${e instanceof Error ? e.message : 'upload failed'}`, 'error')
      }
      setUploading({ done: i + 1, total: list.length })
    }
    setUploading(null)
    setCaption('')
    if (fileRef.current) fileRef.current.value = ''
    const ok = list.length - failed
    if (ok > 0) toast(`${ok} photo${ok === 1 ? '' : 's'} added to the gallery`, 'success')
  }

  async function remove(p: Photo) {
    if (!confirmAction('Delete this photo from the gallery? The file is removed too.')) return
    try {
      await api(`/api/admin/gallery/${p.id}`, { method: 'DELETE' })
      setPhotos(list => list.filter(x => x.id !== p.id))
      toast('Photo deleted', 'success')
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Delete failed', 'error')
    }
  }

  if (guardLoading || !user) return null

  return (
    <div>
      <PageHeader
        title="Gallery"
        subtitle="Photos in the homepage “Our Academy in Action” section. The section and its menu link are hidden while the gallery is empty."
        actions={<ViewSiteLink />}
      />

      <Card style={{ marginBottom: 20 }}>
        <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 15, margin: '0 0 14px' }}>Add photos</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, alignItems: 'end' }}>
          <SelectField label="Category" value={category} onChange={v => setCategory(v as Category)} options={CATEGORIES} />
          <TextField label="Caption (optional)" value={caption} onChange={setCaption} help="Applied to every photo in this upload." />
          <div>
            <Button onClick={() => fileRef.current?.click()} disabled={!!uploading} style={{ width: '100%' }}>
              <IconUpload size={15} />
              {uploading ? `Uploading ${uploading.done}/${uploading.total}…` : 'Choose photos'}
            </Button>
          </div>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: '10px 0 0' }}>PNG, JPG, WEBP or GIF, up to 5MB each. You can select several at once.</p>
        <input ref={fileRef} type="file" hidden multiple accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={e => upload(e.target.files)} />
      </Card>

      {error && <ErrorBanner message={error} onRetry={load} />}

      {loading ? <Loading /> : photos.length === 0 ? (
        <EmptyState>No photos yet — the gallery section is hidden on the site until you add some.</EmptyState>
      ) : (
        <Grid min={220}>
          {photos.map(p => {
            const cat = CATEGORIES.find(c => c.value === p.category)!
            return (
              <Card key={p.id} style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* eslint-disable-next-line @next/next/no-img-element -- storage URL thumbnail */}
                <img src={p.image_url} alt={p.caption} style={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', display: 'block' }} />
                <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                  <div><Badge color={cat.color}>{cat.label}</Badge></div>
                  <p style={{ color: p.caption ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: 13, margin: 0, flex: 1 }}>
                    {p.caption || 'No caption'}
                  </p>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Button variant="secondary" onClick={() => setEditing(p)} style={{ flex: 1 }}><IconPencil size={14} /> Edit</Button>
                    <Button variant="danger" onClick={() => remove(p)} title="Delete"><IconTrash size={14} /></Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </Grid>
      )}

      {editing && (
        <EditPhotoModal
          photo={editing}
          onClose={() => setEditing(null)}
          onSaved={updated => setPhotos(list => list.map(x => (x.id === updated.id ? updated : x)))}
        />
      )}
    </div>
  )
}
