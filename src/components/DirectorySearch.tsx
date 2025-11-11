'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'
import { HealthcareProvider } from '@/types'
import { MagnifyingGlassIcon, FunnelIcon, MapPinIcon } from '@heroicons/react/24/outline'

interface DirectorySearchProps {
  onSearchResults?: (providers: HealthcareProvider[]) => void
  initialProviders?: HealthcareProvider[]
}

export default function DirectorySearch({ onSearchResults, initialProviders = [] }: DirectorySearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedSpecialty, setSelectedSpecialty] = useState('all')
  const [providers, setProviders] = useState<HealthcareProvider[]>(initialProviders)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Memoize supabase client to prevent recreation on every render
  const supabase = useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Supabase environment variables not configured')
      setError('Database connection not configured. Using demo data.')
      return null
    }
    
    return createClient(supabaseUrl, supabaseKey)
  }, [])

  const fetchProviders = useCallback(async () => {
    if (!supabase) {
      // Use mock data as fallback
      const mockResults: HealthcareProvider[] = [
        {
          id: 'demo-1',
          type: 'Hospital',
          name: 'Wynn Hospital',
          description: 'Full-service hospital providing comprehensive medical care',
          address: {
            streetAddress: '111 Hospital Drive',
            addressLocality: 'Utica',
            addressRegion: 'NY',
            postalCode: '13502'
          },
          telephone: '315-917-9966',
          medicalSpecialty: ['Emergency Medicine', 'Cardiology', 'Surgery'],
          isEmergency: true,
          is24Hours: true,
          rating: 4.8,
          reviewCount: 124
        },
        {
          id: 'demo-2',
          type: 'MedicalClinic',
          name: 'WellNow Urgent Care',
          description: 'Walk-in urgent care clinic',
          address: {
            streetAddress: '230 North Genesee Street',
            addressLocality: 'Utica',
            addressRegion: 'NY',
            postalCode: '13502'
          },
          telephone: '315-275-3214',
          medicalSpecialty: ['Urgent Care', 'Occupational Medicine'],
          isEmergency: false,
          is24Hours: false,
          rating: 4.2,
          reviewCount: 89
        }
      ]
      setProviders(mockResults)
      onSearchResults?.(mockResults)
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      let query = supabase
        .from('healthcare_providers')
        .select('*')
        .order('name')

      // Apply search filter
      if (searchQuery.trim()) {
        query = query.ilike('name', `%${searchQuery}%`)
      }

      // Apply category filter
      if (selectedCategory !== 'all') {
        query = query.eq('type', selectedCategory)
      }

      // Apply specialty filter
      if (selectedSpecialty !== 'all') {
        query = query.contains('medical_specialty', [selectedSpecialty])
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        console.error('Error fetching providers:', fetchError)
        setError('Failed to load providers. Please try again.')
        return
      }

      const formattedProviders = data?.map(provider => ({
        ...provider,
        address: typeof provider.address === 'string' ? JSON.parse(provider.address) : provider.address,
        telephone: Array.isArray(provider.telephone) ? provider.telephone : [provider.telephone].filter(Boolean),
        medicalSpecialty: Array.isArray(provider.medical_specialty) ? provider.medical_specialty : [],
        serviceType: Array.isArray(provider.service_type) ? provider.service_type : []
      })) || []

      setProviders(formattedProviders)
      onSearchResults?.(formattedProviders)

    } catch (err) {
      console.error('Unexpected error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [searchQuery, selectedCategory, selectedSpecialty, supabase, onSearchResults])

  useEffect(() => {
    fetchProviders()
  }, [fetchProviders])

  const categories = [
    { value: 'all', label: 'All Types' },
    { value: 'Hospital', label: 'Hospitals' },
    { value: 'MedicalClinic', label: 'Clinics' },
    { value: 'Physician', label: 'Physicians' },
    { value: 'MedicalCenter', label: 'Medical Centers' }
  ]

  const specialties = [
    { value: 'all', label: 'All Specialties' },
    { value: 'Emergency Medicine', label: 'Emergency' },
    { value: 'Cardiology', label: 'Cardiology' },
    { value: 'Pediatrics', label: 'Pediatrics' },
    { value: 'Orthopedics', label: 'Orthopedics' },
    { value: 'Dermatology', label: 'Dermatology' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search and Filters */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Search Input */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search healthcare providers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {specialties.map((specialty) => (
                <option key={specialty.value} value={specialty.value}>
                  {specialty.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          {/* Error Message */}
          {error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Loading providers...</p>
            </div>
          )}

          {/* Results List */}
          {!loading && providers.length > 0 && (
            <div className="space-y-4">
              {providers.map((provider) => (
                <div key={provider.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{provider.name}</h3>
                      <p className="text-gray-600 mb-3">{provider.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center space-x-1">
                          <MapPinIcon className="h-4 w-4" />
                          <span>
                            {Array.isArray(provider.address) 
                              ? provider.address[0]?.addressLocality || 'Location not specified'
                              : provider.address?.addressLocality || 'Location not specified'
                            }
                          </span>
                        </div>
                        <span className="capitalize">{provider.type}</span>
                        {provider.isEmergency && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                            Emergency
                          </span>
                        )}
                      </div>

                      {provider.medicalSpecialty && provider.medicalSpecialty.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {provider.medicalSpecialty.slice(0, 3).map((specialty) => (
                            <span
                              key={specialty}
                              className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      )}

                      {provider.rating && (
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= Math.round(provider.rating!) 
                                    ? 'text-yellow-400 fill-current' 
                                    : 'text-gray-300'
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">
                            {provider.rating} ({provider.reviewCount} reviews)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {!loading && providers.length === 0 && !error && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MagnifyingGlassIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No providers found</h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}