import { redirect } from 'next/navigation'
import { ALL_MARKETING_PRODUCTS, getMarketingProductBySlug } from '@/lib/marketing-products'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return ALL_MARKETING_PRODUCTS.map((product) => ({ slug: product.slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const product = getMarketingProductBySlug(slug)

  if (!product) return {}
  return {
    title: `${product.label} - Verisight`,
    description: product.description,
  }
}

export default async function LegacySolutionRedirectPage({ params }: Props) {
  const { slug } = await params
  redirect(`/producten/${slug}`)
}
