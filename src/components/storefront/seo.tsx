import React from 'react'

interface StoreSeoProps {
  type: 'store' | 'product'
  data: {
    name: string
    description?: string | null
    logo?: string | null
    url: string
    currency?: string
    // Product specific fields
    price?: number
    image?: string | null
    inStock?: boolean
    category?: string | null
  }
}

export function StorefrontSeo({ type, data }: StoreSeoProps) {
  const schema = React.useMemo(() => {
    if (type === 'product') {
      return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: data.name,
        image: data.image || data.logo || undefined,
        description: data.description || `Buy ${data.name} online.`,
        category: data.category || undefined,
        offers: {
          '@type': 'Offer',
          url: data.url,
          priceCurrency: data.currency || 'USD',
          price: data.price || 0,
          availability: data.inStock 
            ? 'https://schema.org/InStock' 
            : 'https://schema.org/OutOfStock',
          itemCondition: 'https://schema.org/NewCondition',
        },
      }
    }

    return {
      '@context': 'https://schema.org',
      '@type': 'Store',
      name: data.name,
      description: data.description || undefined,
      logo: data.logo || undefined,
      url: data.url,
      priceRange: '$$',
      currenciesAccepted: data.currency || 'USD',
    }
  }, [type, data])

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
