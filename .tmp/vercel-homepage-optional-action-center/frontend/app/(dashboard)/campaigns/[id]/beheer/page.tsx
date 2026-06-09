import { notFound } from 'next/navigation'
import { SuiteAccessDenied } from '@/components/dashboard/suite-access-denied'
import { createClient } from '@/lib/supabase/server'
import { loadSuiteAccessContext } from '@/lib/suite-access-server'
import { fetchRouteBeheerData } from './beheer-data'
import {
  RouteBeheerBlockerPanel,
  RouteBeheerHeader,
  RouteBeheerLifecycleSection,
  RouteBeheerSectionsWrapper,
  RouteBeheerStatusCards,
} from './route-beheer-components'

interface Props {
  params: Promise<{ id: string }>
}

export default async function RouteBeheerPage({ params }: Props) {
  const { id } = await params
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
        description="Jouw login opent alleen Action Center voor toegewezen teams. Routebeheer, campagnedetails en rapporten blijven zichtbaar voor HR en Verisight."
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
      <RouteBeheerStatusCards data={data} />
      <RouteBeheerBlockerPanel blockers={data.blockers} />
      <RouteBeheerLifecycleSection data={data} />
      <RouteBeheerSectionsWrapper data={data} />
    </div>
  )
}

