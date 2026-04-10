'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Organization } from '@/lib/types'

interface Props {
  orgs: Organization[]
}

export function InviteClientUserForm({ orgs }: Props) {
  const router = useRouter()
  const [orgId, setOrgId] = useState(orgs[0]?.id ?? '')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'viewer' | 'member'>('viewer')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/org-invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId, fullName, email, role }),
      })
      const json = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(json.detail ?? 'Uitnodiging versturen mislukt.')
        setLoading(false)
        return
      }

      setSuccess(json.message ?? 'Toegang verwerkt.')
      setFullName('')
      setEmail('')
      setRole('viewer')
      router.refresh()
    } catch {
      setError('Verbindingsfout tijdens uitnodigen.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-sm text-gray-500">
        Nodig een klantgebruiker uit voor dashboardtoegang. Nieuwe gebruikers ontvangen een activatiemail;
        bestaande gebruikers worden direct gekoppeld aan de organisatie.
      </p>
      <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-3 text-xs leading-5 text-blue-900">
        De activatiemail start het account. Nieuwe gebruikers openen de link, kiezen direct een wachtwoord en gaan daarna
        verder naar het dashboard met dit e-mailadres.
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Organisatie</label>
        <select value={orgId} onChange={e => setOrgId(e.target.value)} className={selectCls}>
          {orgs.map(org => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Naam contactpersoon</label>
        <input
          type="text"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          placeholder="Bijv. Sophie Jansen"
          className={inputCls}
        />
        <p className="mt-1 text-xs text-gray-400">
          Optioneel, maar aanbevolen. Deze naam gebruiken we voor de uitnodiging en het klantoverzicht.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">E-mailadres</label>
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="naam@organisatie.nl"
          className={inputCls}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
        <select value={role} onChange={e => setRole(e.target.value as 'viewer' | 'member')} className={selectCls}>
          <option value="viewer">Viewer - alleen dashboard en rapport</option>
          <option value="member">Member - uitgebreidere interne rol</option>
        </select>
        <p className="mt-1 text-xs text-gray-400">
          Gebruik standaard <span className="font-medium text-gray-500">Viewer</span>. Kies alleen{' '}
          <span className="font-medium text-gray-500">Member</span> als iemand later ook schrijfrechten binnen de
          organisatie moet krijgen.
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-3 text-sm text-green-700">
          <p>{success}</p>
          <p className="mt-1 text-xs text-green-700">
            Nieuwe gebruiker? Die kiest via de activatiemail eerst een wachtwoord en kan daarna direct inloggen.
          </p>
        </div>
      )}

      <button type="submit" disabled={loading || !orgId} className={btnCls}>
        {loading ? 'Bezig...' : 'Klanttoegang versturen'}
      </button>
    </form>
  )
}

const inputCls =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
const selectCls =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
const btnCls =
  'w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors'
