'use client'

import { useState } from 'react'
import { MagnifyingGlassIcon, MapPinIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline'
import Navigation from '@/components/Navigation'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', label: 'All Services' },
    { id: 'hospital', label: 'Hospitals' },
    { id: 'urgent-care', label: 'Urgent Care' },
    { id: 'primary-care', label: 'Primary Care' },
    { id: 'specialist', label: 'Specialists' },
    { id: 'mental-health', label: 'Mental Health' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
              Find healthcare that
              <span className="text-primary-500"> works for you</span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
              Discover trusted healthcare providers in Oneida County. Read reviews, book appointments, 
              and connect with our community.
            </p>
            
            {/* Search Bar */}
            <div className="mt-12 max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-2">
                <div className="flex flex-col md:flex-row gap-2">
                  {/* Search Input */}
                  <div className="flex-1 flex items-center space-x-3 bg-gray-50 rounded-xl px-4 py-4">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search doctors, hospitals, or conditions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none"
                    />
                  </div>
                  
                  {/* Location */}
                  <div className="flex items-center space-x-3 bg-gray-50 rounded-xl px-4 py-4 md:w-64">
                    <MapPinIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700">Oneida County, NY</span>
                  </div>
                  
                  {/* Search Button */}
                  <button className="bg-primary-500 text-white px-8 py-4 rounded-xl hover:bg-primary-600 transition-colors font-medium">
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-primary-100 text-primary-700 border-2 border-primary-200'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">150+</div>
              <div className="text-gray-600">Healthcare Providers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">25+</div>
              <div className="text-gray-600">Specialties</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">1,200+</div>
              <div className="text-gray-600">Patient Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">24/7</div>
              <div className="text-gray-600">Concierge Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Everything you need for healthcare</h2>
            <p className="mt-4 text-xl text-gray-600">Comprehensive tools to help you make informed healthcare decisions</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-gray-50">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MagnifyingGlassIcon className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Directory</h3>
              <p className="text-gray-600">Find the right healthcare provider with intelligent search and filtering</p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-gray-50">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ChatBubbleLeftIcon className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Concierge</h3>
              <p className="text-gray-600">Get personalized recommendations and instant answers to your questions</p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-gray-50">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPinIcon className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Community Reviews</h3>
              <p className="text-gray-600">Read authentic reviews and connect with others in your community</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}