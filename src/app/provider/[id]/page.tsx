'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { ReviewForm, ReviewsList } from '@/components/Reviews'
import { 
  PhoneIcon, 
  MapPinIcon, 
  ClockIcon, 
  GlobeAltIcon,
  StarIcon 
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'

export default function ProviderDetailPage() {
  const params = useParams()
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  // Mock provider data - in real app, fetch from Supabase using params.id
  const provider = {
    id: '1',
    type: 'Hospital' as const,
    name: 'Wynn Hospital',
    description: 'Level III Trauma Center serving the Mohawk Valley region with comprehensive medical services.',
    address: {
      streetAddress: '111 Hospital Drive',
      addressLocality: 'Utica',
      addressRegion: 'NY',
      postalCode: '13502'
    },
    telephone: '315-917-9966',
    website: 'https://mvhealthsystem.org',
    medicalSpecialty: ['Emergency', 'Cardiology', 'Surgery', 'Oncology', 'Pediatrics'],
    rating: 4.5,
    reviewCount: 127,
    isEmergency: true,
    is24Hours: true,
    parentOrganization: {
      name: 'Mohawk Valley Health System'
    }
  }

  const mockReviews = [
    {
      id: '1',
      providerId: '1',
      userId: '1',
      rating: 5,
      title: 'Excellent Emergency Care',
      content: 'The emergency department was incredibly efficient. Staff was professional and compassionate.',
      isAnonymous: false,
      isVerified: true,
      visitDate: '2024-10-15',
      createdAt: '2024-10-16T10:30:00Z',
      updatedAt: '2024-10-16T10:30:00Z',
      user: {
        firstName: 'Sarah',
        lastName: 'Johnson',
        isVerified: true
      }
    }
  ]

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'reviews', label: `Reviews (${provider.reviewCount})` },
    { id: 'services', label: 'Services' },
    { id: 'contact', label: 'Contact' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Provider Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{provider.name}</h1>
                {provider.isEmergency && (
                  <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                    Emergency
                  </span>
                )}
                {provider.is24Hours && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                    24/7
                  </span>
                )}
              </div>
              
              <p className="text-lg text-gray-600 mb-4">{provider.description}</p>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarSolidIcon
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Math.floor(provider.rating) 
                            ? 'text-yellow-400' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium text-gray-900">{provider.rating}</span>
                  <span className="text-gray-500">({provider.reviewCount} reviews)</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <MapPinIcon className="h-4 w-4" />
                  <span>
                    {provider.address.streetAddress}, {provider.address.addressLocality}, {provider.address.addressRegion}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 md:mt-0 md:ml-8">
              <button
                onClick={() => setShowReviewForm(true)}
                className="w-full md:w-auto px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Write a Review
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
                <p className="text-gray-700 leading-relaxed">{provider.description}</p>
                {provider.parentOrganization && (
                  <div className="mt-4">
                    <span className="text-sm text-gray-500">Part of: </span>
                    <span className="text-sm font-medium text-gray-900">
                      {provider.parentOrganization.name}
                    </span>
                  </div>
                )}
              </div>
              
              {provider.medicalSpecialty && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Specialties & Services</h3>
                  <div className="flex flex-wrap gap-2">
                    {provider.medicalSpecialty.map((specialty) => (
                      <span
                        key={specialty}
                        className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{provider.telephone}</div>
                      <div className="text-sm text-gray-500">Main Number</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {provider.address.streetAddress}
                      </div>
                      <div className="text-sm text-gray-500">
                        {provider.address.addressLocality}, {provider.address.addressRegion} {provider.address.postalCode}
                      </div>
                    </div>
                  </div>
                  
                  {provider.website && (
                    <div className="flex items-start space-x-3">
                      <GlobeAltIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <a
                          href={provider.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-primary-600 hover:text-primary-700"
                        >
                          Visit Website
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {provider.is24Hours && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Open 24/7</span>
                  </div>
                  <p className="text-sm text-green-700 mt-2">
                    Emergency services available around the clock
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Patient Reviews ({provider.reviewCount})
              </h2>
              <button
                onClick={() => setShowReviewForm(true)}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Write a Review
              </button>
            </div>
            <ReviewsList reviews={mockReviews} />
          </div>
        )}

        {activeTab === 'services' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Services & Specialties</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {provider.medicalSpecialty?.map((specialty) => (
                <div key={specialty} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-medium">✓</span>
                  </div>
                  <span className="font-medium text-gray-900">{specialty}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Contact & Location</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <PhoneIcon className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-900">{provider.telephone}</span>
                    </div>
                    {provider.website && (
                      <div className="flex items-center space-x-3">
                        <GlobeAltIcon className="h-5 w-5 text-gray-400" />
                        <a
                          href={provider.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700"
                        >
                          {provider.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Address</h3>
                  <div className="text-gray-700">
                    <p>{provider.address.streetAddress}</p>
                    <p>{provider.address.addressLocality}, {provider.address.addressRegion} {provider.address.postalCode}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Map</h3>
                <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">Map placeholder</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <ReviewForm
          providerId={provider.id}
          onSubmit={(review) => {
            console.log('Submitted review:', review)
            setShowReviewForm(false)
          }}
          onClose={() => setShowReviewForm(false)}
        />
      )}
    </div>
  )
}