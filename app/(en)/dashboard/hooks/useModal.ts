'use client'
import { useEffect } from 'react'

/**
 * Shared modal behaviour for the dashboard's dialogs.
 *
 * Every modal was previously dismissable only by clicking its × or the
 * backdrop: Escape did nothing, and the page behind kept scrolling under the
 * overlay. This adds both, and returns the ARIA props the overlay needs so the
 * dialog is announced rather than read as an ordinary div.
 */
export function useModal(onClose: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    document.addEventListener('keydown', onKey)

    // Lock background scroll while the dialog is open.
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [onClose])
}

/** Spread onto the modal's overlay element. */
export const modalOverlayProps = {
  role: 'dialog',
  'aria-modal': true,
} as const
