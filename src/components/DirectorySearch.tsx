'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { MagnifyingGlassIcon, FunnelIcon, MapIcon, ListBulletIcon } from '@heroicons/react/24/outline'
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
}

export default function DirectorySearch({ onSearchResults, initialProviders = [] }: DirectorySearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedSpecialty, setSelectedSpecialty] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [providers, setProviders] = useState<HealthcareProvider[]>(initialProviders)
  const [loading, setLoading] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<HealthcareProvider | undefined>(undefined)
  const router = useRouter()
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )

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

  const fetchProviders = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase.from('healthcare_providers').select('*')

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,medicalSpecialty.cs.["${searchQuery}"]`)
      }

      if (selectedCategory && selectedCategory !== 'all') {
        query = query.eq('type', selectedCategory)
      }

      if (selectedSpecialty && selectedSpecialty !== 'all') {
        query = query.contains('medicalSpecialty', [selectedSpecialty])
      }

      const { data, error } = await query.order('name')

      if (error) {
        console.error('Error fetching providers:', error)
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
        setProviders(mockResults)
        onSearchResults?.(mockResults)
      } else {
        setProviders(data || [])
        onSearchResults?.(data || [])
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, selectedCategory, selectedSpecialty, supabase, onSearchResults])

  useEffect(() => {
    if (initialProviders.length === 0) {
      fetchProviders()
    }
  }, [fetchProviders, initialProviders.length])

  const handleSearch = async () => {
    await fetchProviders()
  }

  const handleProviderClick = (provider: HealthcareProvider) => {
    setSelectedProvider(provider)
    if (viewMode === 'list') {
      setViewMode('map')
    }
  }

  const handleProviderCardClick = (provider: HealthcareProvider) => {
    router.push(`/provider/${provider.id}`)
  }

  return (
    <div className="bg-white">
      {/* Search Bar */}
      <div className="max-w-6xl mx-auto p-6">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Provider Type
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {specialties.map((specialty) => (
                      <option key={specialty.id} value={specialty.id}>
                        {specialty.label}
                      </option>
                    ))}
                  </select>
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
                onProviderClick={setSelectedProvider}
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
                  onMapClick={() => handleProviderClick(provider)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}