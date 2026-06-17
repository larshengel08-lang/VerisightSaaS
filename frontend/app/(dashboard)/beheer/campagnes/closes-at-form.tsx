'use client'

import { useTransition } from 'react'
import { setClosesAtAction } from './set-closes-at-action'

export function ClosesAtForm({ campaignId, currentValue }: { campaignId: string; currentValue: string | null }) {
  const [pending, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value || null
    startTransition(() => {
      setClosesAtAction(campaignId, value).catch(console.error)
    })
  }

  return (
    <input
      type="date"
      defaultValue={currentValue ?? ''}
      onChange={handleChange}
      disabled={pending}
      className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-700 transition focus:border-slate-400 focus:outline-none disabled:opacity-50"
      title="Geplande sluitdatum"
    />
  )
}
