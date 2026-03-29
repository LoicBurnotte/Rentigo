import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getImageUrl, formatCurrency } from '@/lib/utils'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ItemDetailClient } from './item-detail-client'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()

  const { data: item } = await supabase
    .from('items')
    .select('*, owner:users!owner_id(name), category:categories!category_id(name)')
    .eq('slug', slug)
    .single()

  if (!item) {
    return { title: 'Item Not Found' }
  }

  const title = `Rent ${item.title} in ${item.city}`
  const description = `${item.description.slice(0, 160)}. Available for ${formatCurrency(item.price_per_day)}/day on Rentigo.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: item.images?.[0] ? [{ url: getImageUrl(item.images[0]), width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `/items/${slug}`,
    },
  }
}

export default async function ItemPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()

  const { data: item } = await supabase
    .from('items')
    .select('*, owner:users!owner_id(id, name, avatar_url, is_paused), category:categories!category_id(*)')
    .eq('slug', slug)
    .single()

  if (!item) {
    notFound()
  }

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: item.title,
    description: item.description,
    image: item.images?.map(getImageUrl) || [],
    offers: {
      '@type': 'Offer',
      price: item.price_per_day,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    },
    brand: {
      '@type': 'Person',
      name: (item.owner as { name: string }).name,
    },
    category: (item.category as { name: string }).name,
    areaServed: {
      '@type': 'City',
      name: item.city,
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ItemDetailClient item={item as never} />
    </>
  )
}
