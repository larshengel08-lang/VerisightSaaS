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
        className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
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
        <div className="absolute top-14 left-0 right-0 bg-white border-b border-gray-200 shadow-md z-50 px-4 py-3 flex flex-col gap-1">
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          >
            Campaigns
          </Link>
          {isAdmin && (
            <Link
              href="/beheer"
              onClick={() => setOpen(false)}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              Setup
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
