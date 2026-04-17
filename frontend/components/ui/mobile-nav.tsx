'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Props {
  isAdmin: boolean
}

export function MobileNav({ isAdmin }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="sm:hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="rounded-md p-2 text-[color:var(--text)] transition-colors hover:bg-[color:var(--bg)] hover:text-[color:var(--ink)]"
        aria-label="Menu openen"
      >
        {open ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-14 z-50 flex flex-col gap-1 border-b border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 shadow-md">
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="rounded-md px-3 py-2 text-sm font-medium text-[color:var(--text)] transition-colors hover:bg-[color:var(--bg)] hover:text-[color:var(--ink)]"
          >
            Campaigns
          </Link>
          {isAdmin && (
            <>
              <Link
                href="/beheer"
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-[color:var(--text)] transition-colors hover:bg-[color:var(--bg)] hover:text-[color:var(--ink)]"
              >
                Setup
              </Link>
              <Link
                href="/beheer/contact-aanvragen"
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-[color:var(--text)] transition-colors hover:bg-[color:var(--bg)] hover:text-[color:var(--ink)]"
              >
                Leads
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  )
}
