'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { MagnifyingGlassIcon, FunnelIcon, MapIcon, ListBulletIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { StarIcon } from '@heroicons/react/24/solid'
import { HealthcareProvider } from '@/types'
import { createClient } from '@supabase/supabase-js'
import Map from './Map'

type ViewMode = 'list' | 'map'

interface ProviderCardProps {
  provider: HealthcareProvider
  onClick?: () => void
  onMapClick?: () => void
}

function ProviderCard({ provider, onClick, onMapClick }: ProviderCardProps) {
  const address = Array.isArray(provider.address) ? provider.address[0] : provider.address
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{provider.name}</h3>
          <p className="text-sm text-gray-500 capitalize mb-2">{provider.type.replace(/([A-Z])/g, ' $1').trim()}</p>
          <div className="flex flex-wrap gap-1 mb-3">
            {provider.isEmergency && (
              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                Emergency
              </span>
            )}
            {provider.is24Hours && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                24/7
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onMapClick}
            className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
            title="View on map"
          >
            <MapIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {provider.medicalSpecialty && provider.medicalSpecialty.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {provider.medicalSpecialty.slice(0, 3).map((specialty: string, index: number) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded"
              >
                {specialty}
              </span>
            ))}
            {provider.medicalSpecialty.length > 3 && (
              <span className="px-2 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded">
                +{provider.medicalSpecialty.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}
      
      <div className="text-sm text-gray-600 mb-3">
        <p>{address.streetAddress}</p>
        <p>{address.addressLocality}, {address.addressRegion} {address.postalCode}</p>
      </div>
      
      {provider.rating && (
        <div className="flex items-center space-x-2 mb-3">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon
                key={star}
                className={`h-4 w-4 ${
                  star <= Math.floor(provider.rating!) 
                    ? 'text-yellow-400' 
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-gray-900">{provider.rating}</span>
          <span className="text-sm text-gray-500">({provider.reviewCount} reviews)</span>
        </div>
      )}
      
      {provider.telephone && (
        <p className="text-sm text-primary-600 font-medium mb-4">
          {Array.isArray(provider.telephone) ? provider.telephone[0] : provider.telephone}
        </p>
      )}
      
      <button
        onClick={onClick}
        className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
      >
        View Details
      </button>
    </div>
  )
}

interface DirectorySearchProps {
  onSearchResults?: (providers: HealthcareProvider[]) => void
  initialProviders?: HealthcareProvider[]
  aiFilters?: {
    searchQuery?: string
    specialty?: string
    providerType?: string
    insurance?: string
    location?: string
    emergency?: boolean
    rating?: number
  } | null
  onFiltersCleared?: () => void
}

export default function DirectorySearch({ onSearchResults, initialProviders = [], aiFilters, onFiltersCleared }: DirectorySearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedSpecialty, setSelectedSpecialty] = useState('all')
  const [selectedInsurance, setSelectedInsurance] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [minRating, setMinRating] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [providers, setProviders] = useState<HealthcareProvider[]>(initialProviders)
  const [loading, setLoading] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<HealthcareProvider | undefined>(undefined)
  const router = useRouter()
  const onSearchResultsRef = useRef(onSearchResults)
  
  // Memoize supabase client to prevent recreation on every render
  const supabase = useMemo(() => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  ), [])

  // Update the ref when the callback changes
  useEffect(() => {
    onSearchResultsRef.current = onSearchResults
  }, [onSearchResults])

  // Apply AI-generated filters
  useEffect(() => {
    if (aiFilters) {
      console.log('🤖 Applying AI filters:', aiFilters)
      
      // Parse search query for specialty keywords
      if (aiFilters.searchQuery) {
        const queryLower = aiFilters.searchQuery.toLowerCase()
        
        // Check for specialty keywords in search query
        if (queryLower.includes('pediatric') || queryLower.includes('pediatrician') || queryLower.includes('child')) {
          setSelectedSpecialty('Pediatrics')
        } else if (queryLower.includes('heart') || queryLower.includes('cardiolog')) {
          setSelectedSpecialty('Cardiology')
        } else if (queryLower.includes('knee') || queryLower.includes('orthoped') || queryLower.includes('bone') || queryLower.includes('joint')) {
          setSelectedSpecialty('Orthopedics')
        } else if (queryLower.includes('skin') || queryLower.includes('dermatolog')) {
          setSelectedSpecialty('Dermatology')
        } else if (queryLower.includes('mental') || queryLower.includes('anxiety') || queryLower.includes('depression') || queryLower.includes('therapy')) {
          setSelectedSpecialty('Mental Health')
        } else if (queryLower.includes('primary care') || queryLower.includes('family doctor') || queryLower.includes('general practitioner')) {
          setSelectedSpecialty('Primary Care')
        } else if (queryLower.includes('emergency') || queryLower.includes('urgent')) {
          setSelectedSpecialty('Emergency')
        } else if (queryLower.includes('cancer') || queryLower.includes('oncolog')) {
          setSelectedSpecialty('Oncology')
        } else if (queryLower.includes('brain') || queryLower.includes('neurolog')) {
          setSelectedSpecialty('Neurology')
        }
        
        setSearchQuery(aiFilters.searchQuery)
      }
      
      if (aiFilters.providerType) setSelectedCategory(aiFilters.providerType)
      if (aiFilters.specialty) setSelectedSpecialty(aiFilters.specialty)
      
      // Normalize insurance names to match our dropdown options
      if (aiFilters.insurance) {
        const normalizedInsurance = aiFilters.insurance.toLowerCase()
        if (normalizedInsurance.includes('blue cross')) {
          setSelectedInsurance('Blue Cross')
        } else if (normalizedInsurance.includes('medicaid')) {
          setSelectedInsurance('Medicaid')
        } else if (normalizedInsurance.includes('medicare')) {
          setSelectedInsurance('Medicare')
        } else if (normalizedInsurance.includes('aetna')) {
          setSelectedInsurance('Aetna')
        } else if (normalizedInsurance.includes('united')) {
          setSelectedInsurance('UnitedHealthcare')
        } else if (normalizedInsurance.includes('cigna')) {
          setSelectedInsurance('Cigna')
        } else if (normalizedInsurance.includes('humana')) {
          setSelectedInsurance('Humana')
        } else {
          setSelectedInsurance(aiFilters.insurance)
        }
      }
      
      if (aiFilters.location) setSelectedLocation(aiFilters.location)
      if (aiFilters.rating) setMinRating(aiFilters.rating)
      
      // Auto-open filters if AI set them
      if (aiFilters.providerType || aiFilters.specialty || aiFilters.insurance || aiFilters.location || aiFilters.rating) {
        setShowFilters(true)
      }
      
      // The auto-search effect will trigger fetchProviders after state updates
    }
  }, [aiFilters])

  const categories = [
    { id: 'all', label: 'All Providers' },
    { id: 'Hospital', label: 'Hospitals' },
    { id: 'MedicalClinic', label: 'Medical Clinics' },
    { id: 'Physician', label: 'Physicians' },
    { id: 'MedicalCenter', label: 'Medical Centers' },
    { id: 'MedicalLaboratory', label: 'Laboratories' },
  ]

  const specialties = [
    { id: 'all', label: 'All Specialties' },
    { id: 'Emergency', label: 'Emergency Care' },
    { id: 'Primary Care', label: 'Primary Care' },
    { id: 'Cardiology', label: 'Cardiology' },
    { id: 'Orthopedics', label: 'Orthopedics' },
    { id: 'Neurology', label: 'Neurology' },
    { id: 'Oncology', label: 'Oncology' },
    { id: 'Pediatrics', label: 'Pediatrics' },
    { id: 'Dermatology', label: 'Dermatology' },
    { id: 'Mental Health', label: 'Mental Health' },
  ]

  const insuranceOptions = [
    { id: 'all', label: 'All Insurance' },
    { id: 'Blue Cross', label: 'Blue Cross Blue Shield' },
    { id: 'Aetna', label: 'Aetna' },
    { id: 'UnitedHealthcare', label: 'UnitedHealthcare' },
    { id: 'Cigna', label: 'Cigna' },
    { id: 'Medicaid', label: 'Medicaid' },
    { id: 'Medicare', label: 'Medicare' },
    { id: 'Humana', label: 'Humana' },
  ]

  const locationOptions = [
    { id: 'all', label: 'All Locations' },
    { id: 'Utica', label: 'Utica' },
    { id: 'Rome', label: 'Rome' },
    { id: 'New Hartford', label: 'New Hartford' },
    { id: 'Oneida', label: 'Oneida' },
    { id: 'Clinton', label: 'Clinton' },
  ]

  const fetchProviders = useCallback(async () => {
    setLoading(true)
    try {
      console.log('🔍 Fetching providers with filters:', {
        searchQuery,
        selectedCategory,
        selectedSpecialty,
        selectedInsurance,
        selectedLocation,
        minRating
      })

      let query = supabase.from('healthcare_providers').select('*')

      if (searchQuery) {
        // Search by name and medical specialties
        query = query.or(`name.ilike.%${searchQuery}%`)
      }

      if (selectedCategory && selectedCategory !== 'all') {
        query = query.eq('type', selectedCategory)
      }

      if (selectedSpecialty && selectedSpecialty !== 'all') {
        // Use contains for array search with correct column name
        query = query.contains('medical_specialty', [selectedSpecialty])
      }

      if (selectedInsurance && selectedInsurance !== 'all') {
        // Filter by insurance accepted
        // "Most Insurance Plans" should match all providers
        if (selectedInsurance !== 'Most Insurance Plans') {
          query = query.contains('accepts_insurance', [selectedInsurance])
        }
      }

      if (selectedLocation && selectedLocation !== 'all') {
        // Filter by city/location
        query = query.ilike('address->0->addressLocality', `%${selectedLocation}%`)
      }

      if (minRating > 0) {
        query = query.gte('rating', minRating)
      }

      console.log('🔍 Executing Supabase query...')
      const { data, error } = await query.order('name')

      if (error) {
        console.error('❌ Supabase Error Details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        // Fallback to mock data
        const mockResults: HealthcareProvider[] = [
          {
            id: '1',
            type: 'Hospital',
            name: 'Wynn Hospital',
            address: {
              streetAddress: '111 Hospital Drive',
              addressLocality: 'Utica',
              addressRegion: 'NY',
              postalCode: '13502'
            },
            telephone: '315-917-9966',
            medicalSpecialty: ['Emergency', 'Cardiology', 'Surgery'],
            rating: 4.5,
            reviewCount: 127,
            isEmergency: true,
            is24Hours: true,
            website: 'https://mvhealthsystem.org'
          },
          {
            id: '2',
            type: 'MedicalClinic',
            name: 'WellNow Urgent Care',
            address: {
              streetAddress: '230 North Genesee Street',
              addressLocality: 'Utica',
              addressRegion: 'NY',
              postalCode: '13502'
            },
            telephone: '315-275-3214',
            medicalSpecialty: ['Urgent Care', 'X-rays', 'Physicals'],
            rating: 4.2,
            reviewCount: 89,
            isEmergency: false,
            is24Hours: false
          },
          {
            id: '3',
            type: 'Physician',
            name: 'Dr. Sarah Johnson, MD',
            address: {
              streetAddress: '1656 Champlin Avenue',
              addressLocality: 'Utica',
              addressRegion: 'NY',
              postalCode: '13502'
            },
            telephone: '315-624-6000',
            medicalSpecialty: ['Family Medicine', 'Internal Medicine'],
            rating: 4.8,
            reviewCount: 45,
            isEmergency: false,
            is24Hours: false
          }
        ]
        console.log('📋 Using fallback mock data')
        setProviders(mockResults)
        onSearchResultsRef.current?.(mockResults)
      } else {
        console.log('✅ Successfully fetched providers:', data?.length)
        // Transform database fields to match TypeScript interface
        const transformedData = data?.map((provider: any) => ({
          ...provider,
          medicalSpecialty: provider.medical_specialty,
          serviceType: provider.service_type,
          reviewCount: provider.review_count,
          isEmergency: provider.is_emergency,
          is24Hours: provider.is_24_hours,
          acceptsInsurance: provider.accepts_insurance,
          languagesSpoken: provider.languages_spoken,
          parentOrganization: provider.parent_organization,
          hasPOS: provider.has_pos,
          geocodingAccuracy: provider.geocoding_accuracy,
          geocodedAddress: provider.geocoded_address,
          createdAt: provider.created_at,
          updatedAt: provider.updated_at
        })) || []
        
        setProviders(transformedData)
        onSearchResultsRef.current?.(transformedData)
      }
    } catch (error) {
      console.error('💥 Fetch error:', error)
      // Use mock data as fallback
      const mockResults: HealthcareProvider[] = []
      setProviders(mockResults)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, selectedCategory, selectedSpecialty, selectedInsurance, selectedLocation, minRating, supabase]) // Include all filter dependencies

  // Single useEffect for all data fetching
  useEffect(() => {
    if (initialProviders.length === 0) {
      console.log('🎯 Fetching providers due to search/filter change')
      fetchProviders()
    }
  }, [fetchProviders, initialProviders.length])

  // Auto-search when filters change (except on initial load)
  const isInitialMount = useRef(true)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
    } else {
      // Debounce the search to avoid too many requests
      const timeoutId = setTimeout(() => {
        console.log('🔄 Filters changed, auto-searching...')
        fetchProviders()
      }, 300)
      return () => clearTimeout(timeoutId)
    }
  }, [selectedCategory, selectedSpecialty, selectedInsurance, selectedLocation, minRating])

  const handleSearch = async () => {
    await fetchProviders()
  }

  const handleProviderClick = useCallback((provider: HealthcareProvider) => {
    setSelectedProvider(provider)
    if (viewMode === 'list') {
      setViewMode('map')
    }
  }, [viewMode])

  const handleProviderCardClick = useCallback((provider: HealthcareProvider) => {
    router.push(`/provider/${provider.id}`)
  }, [router])

  const handleMapClick = useCallback((provider: HealthcareProvider) => {
    handleProviderClick(provider)
  }, [handleProviderClick])

  return (
    <div className="bg-white">
      {/* Search Bar */}
      <div className="max-w-6xl mx-auto p-6">
        {/* AI Filter Badge */}
        {aiFilters && Object.keys(aiFilters).length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <SparklesIcon className="h-5 w-5 text-blue-600" />
              <p className="text-sm font-medium text-blue-900">
                AI Assistant applied filters based on your conversation
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
                setSelectedSpecialty('all')
                setSelectedInsurance('all')
                setSelectedLocation('all')
                setMinRating(0)
                onFiltersCleared?.()
              }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Main Search Input */}
            <div className="flex-1 flex items-center space-x-3 bg-gray-50 rounded-xl px-4 py-4">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search doctors, hospitals, or conditions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <span className="text-gray-700">Filters</span>
            </button>
            
            {/* View Mode Toggle */}
            <div className="bg-gray-100 rounded-xl p-1 flex">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ListBulletIcon className="h-4 w-4" />
                <span>List</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
                  viewMode === 'map'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <MapIcon className="h-4 w-4" />
                <span>Map</span>
              </button>
            </div>
            
            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-primary-500 text-white px-8 py-4 rounded-xl hover:bg-primary-600 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
          
          {/* Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Provider Type
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialty
                  </label>
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                  >
                    {specialties.map((specialty) => (
                      <option key={specialty.id} value={specialty.id}>
                        {specialty.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Insurance Accepted
                  </label>
                  <select
                    value={selectedInsurance}
                    onChange={(e) => setSelectedInsurance(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                  >
                    {insuranceOptions.map((insurance) => (
                      <option key={insurance.id} value={insurance.id}>
                        {insurance.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                  >
                    {locationOptions.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Rating
                  </label>
                  <select
                    value={minRating}
                    onChange={(e) => setMinRating(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                  >
                    <option value={0}>All Ratings</option>
                    <option value={3}>3+ Stars</option>
                    <option value={4}>4+ Stars</option>
                    <option value={4.5}>4.5+ Stars</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedCategory('all')
                      setSelectedSpecialty('all')
                      setSelectedInsurance('all')
                      setSelectedLocation('all')
                      setMinRating(0)
                      onFiltersCleared?.()
                    }}
                    className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Results */}
      {providers.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 pb-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {providers.length} providers found
            </h2>
          </div>
          
          {viewMode === 'map' ? (
            <div className="space-y-6">
              <Map
                providers={providers}
                selectedProvider={selectedProvider}
                onProviderClick={handleProviderClick}
                height="600px"
                className="rounded-lg shadow-lg"
              />
              
              {selectedProvider && (
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {selectedProvider.name}
                      </h3>
                      <p className="text-gray-600">
                        {Array.isArray(selectedProvider.address) 
                          ? `${selectedProvider.address[0].streetAddress}, ${selectedProvider.address[0].addressLocality}, ${selectedProvider.address[0].addressRegion}`
                          : `${selectedProvider.address.streetAddress}, ${selectedProvider.address.addressLocality}, ${selectedProvider.address.addressRegion}`
                        }
                      </p>
                    </div>
                    <button
                      onClick={() => handleProviderCardClick(selectedProvider)}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                  
                  {selectedProvider.rating && (
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIcon
                            key={star}
                            className={`h-5 w-5 ${
                              star <= Math.floor(selectedProvider.rating!)
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {selectedProvider.rating} ({selectedProvider.reviewCount} reviews)
                      </span>
                    </div>
                  )}
                  
                  {selectedProvider.medicalSpecialty && selectedProvider.medicalSpecialty.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Specialties</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProvider.medicalSpecialty.map((specialty: string, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  onClick={() => handleProviderCardClick(provider)}
                  onMapClick={() => handleMapClick(provider)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}