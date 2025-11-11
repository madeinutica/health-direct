'use client'

import { useState } from 'react'
import Navigation from '@/components/Navigation'
import { ReviewsList } from '@/components/Reviews'
import { StarIcon } from '@heroicons/react/24/outline'

export default function ReviewsPage() {
  const [selectedProvider, setSelectedProvider] = useState('all')
  const [selectedRating, setSelectedRating] = useState('all')
  const [sortBy, setSortBy] = useState('recent')

  // Mock data - in real app, fetch from Supabase
  const mockReviews = [
    {
      id: '1',
      providerId: '1',
      userId: '1',
      rating: 5,
      title: 'Excellent Emergency Care',
      content: 'The emergency department at Wynn Hospital was incredibly efficient. The staff was professional and compassionate during a very stressful time. The facilities were clean and modern.',
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
    },
    {
      id: '2',
      providerId: '1',
      userId: '2',
      rating: 4,
      title: 'Good Experience Overall',
      content: 'Had surgery here and the facilities were clean and modern. The nursing staff was attentive and helpful throughout my stay. Wait times were reasonable.',
      isAnonymous: false,
      isVerified: true,
      visitDate: '2024-09-20',
      createdAt: '2024-09-22T14:15:00Z',
      updatedAt: '2024-09-22T14:15:00Z',
      user: {
        firstName: 'Michael',
        lastName: 'Chen',
        isVerified: true
      }
    },
    {
      id: '3',
      providerId: '2',
      userId: '3',
      rating: 5,
      title: 'Quick and Professional',
      content: 'Needed urgent care for a minor injury. The staff at WellNow was quick, professional, and very helpful. Got in and out quickly with great care.',
      isAnonymous: true,
      isVerified: false,
      visitDate: '2024-11-01',
      createdAt: '2024-11-02T09:45:00Z',
      updatedAt: '2024-11-02T09:45:00Z'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Patient Reviews
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Read authentic reviews from patients about their healthcare experiences in Oneida County.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">1,247</div>
              <div className="text-gray-600">Total Reviews</div>
            </div>
            <div>
              <div className="flex items-center justify-center space-x-2 mb-2">
                <span className="text-3xl font-bold text-primary-600">4.6</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      className={`h-6 w-6 ${
                        star <= 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="text-gray-600">Average Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">89%</div>
              <div className="text-gray-600">Verified Reviews</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <select 
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Providers</option>
              <option value="hospitals">Hospitals</option>
              <option value="urgent-care">Urgent Care</option>
              <option value="primary-care">Primary Care</option>
              <option value="specialists">Specialists</option>
            </select>
            
            <select 
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="2">2+ Stars</option>
              <option value="1">1+ Stars</option>
            </select>
            
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="recent">Most Recent</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Recent Reviews ({mockReviews.length})
          </h2>
        </div>
        
        <ReviewsList reviews={mockReviews} />

        {/* Load More */}
        <div className="text-center mt-8">
          <button className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
            Load More Reviews
          </button>
        </div>
      </div>
    </div>
  )
}