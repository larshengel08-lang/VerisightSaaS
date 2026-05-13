import { notFound } from 'next/navigation'
import { SuiteAccessDenied } from '@/components/dashboard/suite-access-denied'
import { createClient } from '@/lib/supabase/server'
import { loadSuiteAccessContext } from '@/lib/suite-access-server'
import { fetchRouteBeheerData } from './beheer-data'
import {
  RouteBeheerHeader,
  RouteBeheerStructuredBody,
} from './route-beheer-components'
import type { HrRouteBeheerPhaseKey } from './beheer-data'

interface Props {
  params: Promise<{ id: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function normalizeSelectedPhase(value: string | string[] | undefined): HrRouteBeheerPhaseKey | null {
  if (typeof value !== 'string') return null

  switch (value) {
    case 'doelgroep':
    case 'communicatie':
    case 'live':
    case 'output':
    case 'afronding':
      return value
    default:
      return null
  }
}

export default async function RouteBeheerPage({ params, searchParams }: Props) {
  const { id } = await params
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  const { context } = await loadSuiteAccessContext(supabase, user.id)

  if (!context.canViewInsights) {
    return (
      <SuiteAccessDenied
        title="Je ziet hier geen routebeheer"
        description="Jouw login opent alleen Action Center voor toegewezen teams. Routebeheer, campagnedetails en rapporten blijven zichtbaar voor HR en Loep."
      />
    )
  }

  const data = await fetchRouteBeheerData({
    campaignId: id,
    supabase,
    userId: user.id,
  })

  if (!data) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <RouteBeheerHeader data={data} />
      <RouteBeheerStructuredBody
        data={data}
        initialSelectedPhaseKey={normalizeSelectedPhase(resolvedSearchParams?.fase)}
      />
    </div>
  )
}

