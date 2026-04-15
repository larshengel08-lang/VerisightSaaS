import 'server-only'

import { getBackendApiUrl } from '@/lib/server-env'
import type { ContactRequestRecord } from '@/lib/pilot-learning'

export async function getContactRequestsForAdmin(limit = 50): Promise<{
  rows: ContactRequestRecord[]
  configError: string | null
  loadError: string | null
}> {
  const adminToken = process.env.BACKEND_ADMIN_TOKEN?.trim()
  if (!adminToken) {
    return {
      rows: [],
      configError: 'BACKEND_ADMIN_TOKEN ontbreekt in de frontend-omgeving, waardoor de interne leadlijst niet kan worden opgehaald.',
      loadError: null,
    }
  }

  try {
    const response = await fetch(`${getBackendApiUrl()}/api/contact-requests?limit=${limit}`, {
      headers: {
        'x-admin-token': adminToken,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}))
      return {
        rows: [],
        configError: null,
        loadError: payload.detail ?? 'Contactaanvragen konden niet worden opgehaald.',
      }
    }

    return {
      rows: (await response.json()) as ContactRequestRecord[],
      configError: null,
      loadError: null,
    }
  } catch {
    return {
      rows: [],
      configError: null,
      loadError: 'De interne leadlijst kon niet worden geladen door een netwerk- of backendfout.',
    }
  }
}
