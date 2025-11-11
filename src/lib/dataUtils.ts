import type { HealthcareProvider, ProcessedProvider } from '@/types'

/**
 * Process raw healthcare provider data into a normalized format
 */
export function processProviders(providers: HealthcareProvider[]): ProcessedProvider[] {
  if (!providers || !Array.isArray(providers)) {
    return []
  }

  return providers.map(provider => {
    // Handle address (could be single object or array)
    const address = Array.isArray(provider.address) 
      ? provider.address[0] 
      : provider.address

    const fullAddress = address 
      ? `${address.streetAddress || ''}, ${address.addressLocality}, ${address.addressRegion} ${address.postalCode || ''}`.trim()
      : ''

    // Handle phone (could be string or array)
    const phone = Array.isArray(provider.telephone)
      ? provider.telephone[0]
      : provider.telephone

    // Determine category based on type and specialties
    let category = provider.type

    if (provider.type === 'Hospital') {
      category = 'Hospital'
    } else if (provider.type === 'MedicalClinic') {
      if (provider.medicalSpecialty?.some(s => s.toLowerCase().includes('urgent'))) {
        category = 'Urgent Care'
      } else if (provider.medicalSpecialty?.some(s => 
        s.toLowerCase().includes('mental') || 
        s.toLowerCase().includes('behavioral') ||
        s.toLowerCase().includes('psychiatr')
      )) {
        category = 'Mental Health'
      } else {
        category = 'Medical Clinic'
      }
    } else if (provider.type === 'Physician') {
      if (provider.medicalSpecialty?.some(s => 
        s.toLowerCase().includes('family') || 
        s.toLowerCase().includes('primary') ||
        s.toLowerCase().includes('internal medicine')
      )) {
        category = 'Primary Care'
      } else {
        category = 'Specialist'
      }
    }

    // Get insurance data from provider or use research data
    const acceptsInsurance = provider.acceptsInsurance || []
    const acceptsMedicaid = acceptsInsurance.some(ins => 
      ins.toLowerCase().includes('medicaid')
    )
    const acceptsMedicare = acceptsInsurance.some(ins => 
      ins.toLowerCase().includes('medicare')
    )

    // Determine network based on organization name
    let network = ''
    if (provider.parentOrganization?.name) {
      network = provider.parentOrganization.name
    } else if (provider.name.toLowerCase().includes('mvhs') || 
               provider.name.toLowerCase().includes('mohawk valley')) {
      network = 'Mohawk Valley Health System'
    } else if (provider.name.toLowerCase().includes('oneida health')) {
      network = 'Oneida Health'
    } else if (provider.name.toLowerCase().includes('rome')) {
      network = 'Rome Health'
    }

    return {
      id: provider.id,
      name: provider.name,
      category,
      organization: provider.parentOrganization?.name || '',
      address: fullAddress,
      location: address?.addressLocality || '',
      phone: phone || '',
      website: provider.website || '',
      specialties: provider.medicalSpecialty || [],
      services: provider.serviceType || [],
      rating: provider.rating,
      reviewCount: provider.reviewCount,
      isEmergency: provider.isEmergency || false,
      is24Hours: provider.is24Hours || false,
      acceptsInsurance,
      acceptsMedicaid,
      acceptsMedicare,
      network,
      latitude: provider.latitude,
      longitude: provider.longitude
    }
  })
}

/**
 * Search providers by query string
 */
export function searchProviders(
  providers: ProcessedProvider[],
  query: string
): ProcessedProvider[] {
  if (!query || !query.trim()) {
    return providers
  }

  const searchTerm = query.toLowerCase()

  return providers.filter(provider => {
    // Search in name
    if (provider.name.toLowerCase().includes(searchTerm)) return true

    // Search in category
    if (provider.category.toLowerCase().includes(searchTerm)) return true

    // Search in specialties
    if (provider.specialties.some(s => s.toLowerCase().includes(searchTerm))) return true

    // Search in services
    if (provider.services.some(s => s.toLowerCase().includes(searchTerm))) return true

    // Search in location
    if (provider.location.toLowerCase().includes(searchTerm)) return true

    // Search in insurance
    if (provider.acceptsInsurance.some(ins => ins.toLowerCase().includes(searchTerm))) return true

    return false
  })
}

/**
 * Filter providers by various criteria
 */
export function filterProviders(
  providers: ProcessedProvider[],
  filters: {
    category?: string
    location?: string
    insurance?: string
    emergency?: boolean
    hours24?: boolean
  }
): ProcessedProvider[] {
  let filtered = [...providers]

  if (filters.category) {
    filtered = filtered.filter(p => p.category === filters.category)
  }

  if (filters.location) {
    filtered = filtered.filter(p => 
      p.location.toLowerCase().includes(filters.location!.toLowerCase())
    )
  }

  if (filters.insurance) {
    const insuranceLower = filters.insurance.toLowerCase()
    filtered = filtered.filter(p => {
      if (insuranceLower.includes('medicaid') && p.acceptsMedicaid) return true
      if (insuranceLower.includes('medicare') && p.acceptsMedicare) return true
      return p.acceptsInsurance.some(ins => 
        ins.toLowerCase().includes(insuranceLower)
      )
    })
  }

  if (filters.emergency) {
    filtered = filtered.filter(p => p.isEmergency)
  }

  if (filters.hours24) {
    filtered = filtered.filter(p => p.is24Hours)
  }

  return filtered
}
