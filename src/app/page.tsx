'use client'

import { useState } from 'react'
import { PaperAirplaneIcon, HeartIcon, ShieldCheckIcon, StarIcon, MapPinIcon, PhoneIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const [inputValue, setInputValue] = useState('')
  const router = useRouter()

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return
    router.push(`/directory?query=${encodeURIComponent(inputValue.trim())}`)
  }

  const handlePromptClick = (prompt: string) => {
    setInputValue(prompt)
  }

  const suggestedPrompts = [
    { text: "I have Blue Cross Blue Shield and need a primary care doctor", color: "from-blue-400 to-blue-500" },
    { text: "I'm experiencing chest pain and need urgent care", color: "from-red-400 to-red-500" },
    { text: "I need a pediatrician for my 5-year-old", color: "from-purple-400 to-purple-500" },
    { text: "Looking for a cardiologist that accepts Medicaid", color: "from-pink-400 to-pink-500" },
    { text: "I have diabetes and need an endocrinologist", color: "from-teal-400 to-teal-500" },
    { text: "Need a dermatologist for a skin condition", color: "from-orange-400 to-orange-500" }
  ]

  const quickSearches = [
    "Primary Care",
    "Urgent Care",
    "Pediatrics",
    "Cardiology",
    "Mental Health",
    "Dermatology"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="px-4 py-6">
        {/* Hero Chat Section */}
        <div className="mb-6">
          {/* Hero Header */}
          <div className="text-center mb-6">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
              Find Your Perfect Provider
            </h1>
            <p className="text-gray-600 text-base font-medium">
              Describe your needs and we'll match you with the right healthcare professional
            </p>
          </div>
          
          {/* Chat Input Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-5">
            <form onSubmit={handleSendMessage} className="p-5">
              <div className="relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Example: I have Blue Cross Blue Shield and need a primary care doctor near Syracuse..."
                  className="w-full px-4 py-4 pr-14 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-700 text-sm font-medium"
                  rows={3}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="absolute bottom-3 right-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-2.5 rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>

          {/* Prompt Slider */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">
              Quick Prompts
            </p>
            <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
              <div className="flex space-x-3 pb-2">
                {suggestedPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePromptClick(prompt.text)}
                    className={`flex-shrink-0 w-64 text-left p-4 bg-gradient-to-r ${prompt.color} hover:opacity-90 rounded-xl transition-all border-0 shadow-md`}
                  >
                    <p className="text-white text-sm font-semibold">{prompt.text}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Featured Provider Card */}
        <div 
          onClick={() => router.push('/directory')}
          className="relative rounded-2xl overflow-hidden mb-6 shadow-xl cursor-pointer transform transition-transform hover:scale-[1.02]"
        >
          {/* Background Image */}
          <div className="relative h-56">
            <img 
              src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80" 
              alt="Hospital"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/80 via-purple-600/80 to-pink-500/80"></div>
            
            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col justify-between p-6 text-white">
              {/* Top Badge */}
              <div className="flex justify-between items-start">
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold">
                  ⭐ 5.0 Featured Provider
                </div>
              </div>

              {/* Bottom Content */}
              <div>
                <h3 className="text-2xl font-extrabold mb-2 tracking-tight">
                  Upstate University Hospital
                </h3>
                <p className="text-white/90 text-sm font-medium mb-3">
                  Emergency Care • Trauma Center • Top Rated
                </p>
                <div className="inline-block bg-white text-purple-600 px-5 py-2 rounded-full text-sm font-bold">
                  Learn More →
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Card */}
        <div className="bg-white rounded-2xl overflow-hidden mb-6 border-2 border-gray-200 shadow-sm">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-3">
              <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Insurance Match</span>
            </div>
            <h3 className="text-xl font-extrabold mb-2 text-blue-600 tracking-tight">
              Finding providers accepting your insurance
            </h3>
            <p className="text-sm text-gray-600 mb-4 font-medium">
              Search by plan and specialty
            </p>
            <button 
              onClick={() => router.push('/directory')}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-blue-700 transition-colors shadow-md"
            >
              Explore →
            </button>
          </div>
        </div>

        {/* Quick Searches */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">Quick Searches</h3>
            <button 
              onClick={() => router.push('/directory')}
              className="text-sm font-bold text-primary-600"
            >
              See All
            </button>
          </div>
          
          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
            <div className="flex space-x-3 pb-2">
              {quickSearches.map((search, idx) => (
                <button
                  key={idx}
                  onClick={() => router.push(`/directory?query=${encodeURIComponent(search)}`)}
                  className="flex-shrink-0 px-5 py-2 bg-white rounded-full border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
          <HeartIcon className="h-8 w-8 mb-3" />
          <h3 className="text-xl font-extrabold mb-2 tracking-tight">
            Quality care starts here
          </h3>
          <p className="text-sm text-blue-100 mb-4 font-medium">
            Browse verified providers in Central New York
          </p>
          <button 
            onClick={() => router.push('/directory')}
            className="text-sm font-bold text-white border-2 border-white px-5 py-2 rounded-full hover:bg-white hover:text-blue-600 transition-colors"
          >
            Learn More
          </button>
        </div>
      </div>
    </div>
  )
}