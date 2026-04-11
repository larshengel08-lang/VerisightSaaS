'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

interface ExpandablePreviewProps {
  src: string
  alt: string
  className?: string
}

export function ExpandablePreview({
  src,
  alt,
  className = '',
}: ExpandablePreviewProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) {
      return undefined
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <div className={className}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group block w-full overflow-hidden rounded-2xl border border-slate-200 bg-white text-left transition hover:border-blue-300 hover:shadow-md"
        >
          <Image
            src={src}
            alt={alt}
            width={1000}
            height={1200}
            className="h-auto w-full transition duration-200 group-hover:scale-[1.01]"
          />
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
            <p className="text-sm font-medium text-slate-700">Klik om te vergroten</p>
            <span className="text-sm font-semibold text-blue-700">Open preview</span>
          </div>
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Vergrote preview van de segment deep dive"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative max-h-[92vh] w-full max-w-5xl overflow-auto rounded-3xl bg-white p-3 shadow-2xl"
            onClick={event => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 rounded-full bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white"
            >
              Sluiten
            </button>
            <Image
              src={src}
              alt={alt}
              width={1400}
              height={1680}
              className="h-auto w-full rounded-2xl"
              priority
            />
          </div>
        </div>
      )}
    </>
  )
}
