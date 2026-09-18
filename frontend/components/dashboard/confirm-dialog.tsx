'use client'

import { useEffect, useId, useRef, type ReactNode } from 'react'

export interface ConfirmDialogAction {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}

interface Props {
  open: boolean
  title: string
  children: ReactNode
  /** In deze volgorde gerenderd; zet de primaire actie als laatste. De eerste knop krijgt focus. */
  actions: ConfirmDialogAction[]
  onClose: () => void
}

const primaryClass =
  'inline-flex items-center justify-center rounded-lg bg-[color:var(--dashboard-ink)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1B2E45] disabled:opacity-50'
const secondaryClass =
  'inline-flex items-center justify-center rounded-lg border border-[color:var(--dashboard-frame-border)] bg-white px-5 py-3 text-sm font-semibold text-[color:var(--dashboard-ink)] transition-colors hover:bg-[color:var(--dashboard-surface)] disabled:opacity-50'

/**
 * Eigen bevestigingsdialoog in de app (spec 2026-09-16 par. 4.3 en 9): geen
 * ingebouwde browserdialoog, zodat de tekst de gevolgen kan benoemen en de knoppen
 * zeggen wat ze doen. Escape en een klik op de achtergrond sluiten zonder
 * actie. De eerste knop (de veilige, niet de primaire) krijgt focus zodra de
 * dialoog opent, Tab loopt binnen de dialoog rond, en de focus keert terug
 * naar het element van vóór het openen zodra de dialoog sluit.
 */
export function ConfirmDialog({ open, title, children, actions, onClose }: Props) {
  const titleId = useId()
  const descriptionId = useId()
  const firstButtonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // onClose in een ref: de effect-dependency blijft [open], zodat een
  // re-render van de ouder (bijv. de 2s-kopieertimeout) de focus niet
  // opnieuw naar de eerste knop stuurt.
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!open) return

    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    firstButtonRef.current?.focus()

    function focusableButtons(): HTMLButtonElement[] {
      const panel = panelRef.current
      if (!panel) return []
      return Array.from(panel.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'))
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab') return
      const focusable = focusableButtons()
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      const previous = previousFocusRef.current
      if (previous && document.contains(previous)) previous.focus()
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#0D1B2A]/60 p-4 sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onClick={(event) => event.stopPropagation()}
        className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-[18px] bg-white p-6 shadow-xl"
      >
        <h2 id={titleId} className="text-lg font-semibold text-[#0D1B2A]">
          {title}
        </h2>
        <div id={descriptionId} className="mt-3 space-y-2 text-sm leading-6 text-[color:var(--dashboard-text)]">
          {children}
        </div>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          {actions.map((action, index) => (
            <button
              key={`${action.label}-${index}`}
              ref={index === 0 ? firstButtonRef : undefined}
              type="button"
              onClick={action.onClick}
              disabled={action.disabled}
              className={action.variant === 'primary' ? primaryClass : secondaryClass}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
