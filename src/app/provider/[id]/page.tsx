'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { 
  MapPinIcon,
  UserIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import dynamic from 'next/dynamic'

// Dynamically import Map component to avoid SSR issues
const Map = dynamic(() => import('@/components/Map'), { ssr: false })

export default function ProviderDetailPage() {
  const params = useParams()

  // Mock provider data - in real app, fetch from Supabase using params.id
  const provider = {
    id: '1',
    type: 'Hospital' as const,
    name: 'Wynn Hospital',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.',
    address: {
      streetAddress: '111 Hospital Drive',
      addressLocality: 'Utica',
      addressRegion: 'NY',
      postalCode: '13502'
    },
    latitude: 43.1009,
    longitude: -75.2327,
    telephone: '315-917-9966',
    website: 'https://mvhealthsystem.org',
    medicalSpecialty: ['Emergency', 'Cardiology', 'Surgery', 'Oncology', 'Pediatrics'],
    rating: 5.0,
    reviewCount: 643,
    isEmergency: true,
    is24Hours: true,
    priceRange: '$50 - $70',
    imageUrl: '/placeholder-hospital.jpg'
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Hero Image Section */}
      <div className="relative w-full h-64 bg-gradient-to-br from-blue-900 via-blue-700 to-cyan-500">
        {/* Placeholder for hero image */}
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Rating Badge */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur rounded-lg px-3 py-2 shadow-lg">
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarSolidIcon
                key={star}
                className="h-4 w-4 text-yellow-400"
              />
            ))}
          </div>
          <div className="text-sm font-bold text-gray-900 mt-1">
            {provider.rating} <span className="font-normal text-gray-600">({provider.reviewCount}) reviews</span>
          </div>
        </div>

        {/* Image Count Badge */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur rounded-lg px-3 py-2 shadow-lg flex items-center space-x-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="font-medium text-gray-900">375</span>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {/* Provider Name & Info */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{provider.name}</h1>
          
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2 text-gray-600">
              <MapPinIcon className="h-5 w-5 text-blue-500" />
              <span>{provider.address.addressLocality}, {provider.address.addressRegion}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="capitalize">{provider.type.replace(/([A-Z])/g, ' $1').trim()}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <p className="text-gray-600 text-sm leading-relaxed">
            {provider.description}
          </p>
        </div>

        {/* Specialties */}
        {provider.medicalSpecialty && provider.medicalSpecialty.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {provider.medicalSpecialty.map((specialty) => (
                <span
                  key={specialty}
                  className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Contact Information */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Contact Information</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-sm text-gray-700">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{provider.telephone}</span>
            </div>
            <div className="flex items-start space-x-3 text-sm text-gray-700">
              <MapPinIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <div>{provider.address.streetAddress}</div>
                <div>{provider.address.addressLocality}, {provider.address.addressRegion} {provider.address.postalCode}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <a 
            href={`tel:${provider.telephone}`}
            className="flex items-center justify-center space-x-2 px-6 py-3 border-2 border-gray-900 text-gray-900 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>Call Now</span>
          </a>
          <a
            href={provider.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <GlobeAltIcon className="h-5 w-5" />
            <span>Visit Website</span>
          </a>
        </div>

        {/* Location Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Location</h2>
          
          {/* Map */}
          <div className="relative w-full h-64 bg-gray-100 rounded-xl overflow-hidden mb-4">
            <Map
              providers={[{
                ...provider,
                address: provider.address
              }]}
              selectedProvider={{
                ...provider,
                address: provider.address
              }}
              className="rounded-xl"
            />
            
            {/* Map Marker Info Card */}
            <div className="absolute bottom-4 left-4 right-4 bg-white rounded-xl shadow-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="relative w-16 h-16 bg-gradient-to-br from-blue-900 via-blue-700 to-cyan-500 rounded-lg flex-shrink-0 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <MapPinIcon className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <h3 className="font-semibold text-gray-900 truncate">{provider.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 truncate capitalize">{provider.type.replace(/([A-Z])/g, ' $1').trim()}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarSolidIcon
                        key={star}
                        className="h-3 w-3 text-yellow-400"
                      />
                    ))}
                    <span className="text-xs font-medium text-gray-900 ml-1">{provider.rating}</span>
                    <span className="text-xs text-gray-500">({provider.reviewCount} reviews)</span>
                  </div>
                </div>
                <a 
                  href={`tel:${provider.telephone}`}
                  className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Location Details */}
          <div className="flex items-start space-x-3 text-sm">
            <MapPinIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-gray-900">{provider.address.streetAddress}</div>
              <div className="text-gray-600">
                {provider.address.addressLocality}, {provider.address.addressRegion} {provider.address.postalCode}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}