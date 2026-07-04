// Module-level singleton — no React needed, works across all client components

export type ToastType = 'success' | 'error' | 'info'

export interface ToastItem {
  id: number
  message: string
  type: ToastType
}

type Listener = (items: ToastItem[]) => void

let _items: ToastItem[] = []
let _id = 0
const _listeners = new Set<Listener>()

function _notify() {
  const snap = [..._items]
  _listeners.forEach(l => l(snap))
}

export function toast(message: string, type: ToastType = 'success') {
  const id = ++_id
  _items = [..._items, { id, message, type }]
  _notify()
  setTimeout(() => {
    _items = _items.filter(t => t.id !== id)
    _notify()
  }, 3000)
}

export function subscribeToasts(listener: Listener): () => void {
  _listeners.add(listener)
  listener([..._items])
  return () => { _listeners.delete(listener) }
}
