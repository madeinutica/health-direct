'use client'

import { useState } from 'react'
import { PaperAirplaneIcon, HeartIcon, ShieldCheckIcon, StarIcon, MapPinIcon, PhoneIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function HomePage() {
  const [inputValue, setInputValue] = useState('')
  const [currentStep, setCurrentStep] = useState<'insurance' | 'needs' | 'complete'>('insurance')
  const [insuranceProvider, setInsuranceProvider] = useState('')
  const [healthcareNeeds, setHealthcareNeeds] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const userInput = inputValue.trim()
    setInputValue('')
    setIsLoading(true)

    try {
      if (currentStep === 'insurance') {
        // Save insurance provider and move to next step
        setInsuranceProvider(userInput)
        setCurrentStep('needs')
        setIsLoading(false)
      } else if (currentStep === 'needs') {
        // Save healthcare needs
        setHealthcareNeeds(userInput)
        setCurrentStep('complete')
        
        // Get AI recommendation and redirect
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `Insurance: ${insuranceProvider}. Need: ${userInput}. Provide a brief search query to find the right provider.`,
            context: [],
            insurance: insuranceProvider,
            needs: userInput
          })
        })

        if (response.ok) {
          const data = await response.json()
          // Redirect with insurance and needs as separate params
          router.push(`/directory?insurance=${encodeURIComponent(insuranceProvider)}&needs=${encodeURIComponent(userInput)}&query=${encodeURIComponent(`${insuranceProvider} ${userInput}`)}`)
        } else {
          // Fallback: redirect with basic search
          router.push(`/directory?insurance=${encodeURIComponent(insuranceProvider)}&needs=${encodeURIComponent(userInput)}&query=${encodeURIComponent(userInput)}`)
        }
      }
    } catch (error) {
      console.error('Error:', error)
      // Fallback on error
      if (currentStep === 'needs') {
        router.push(`/directory?query=${encodeURIComponent(inputValue)}`)
      } else {
        setIsLoading(false)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e as any)
    }
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
      {/* Desktop Hero Background */}
      <div className="hidden lg:block fixed inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600&q=80"
          alt="Healthcare professionals"
          fill
          className="object-cover opacity-10"
        />
      </div>

      <div className="relative z-10 px-4 py-6 max-w-7xl mx-auto lg:px-8 lg:py-12">
        {/* Hero Chat Section */}
        <div className="mb-6 lg:mb-12">
          {/* Hero Header */}
          <div className="text-center mb-6 lg:mb-8">
            <h1 className="text-4xl lg:text-6xl font-extrabold text-gray-900 mb-2 tracking-tight">
              Find Your Perfect Provider
            </h1>
            <p className="text-gray-600 text-base lg:text-lg font-medium max-w-2xl mx-auto">
              Describe your needs and we&apos;ll match you with the right healthcare professional
            </p>
          </div>
          
          {/* Chat Input Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-5 max-w-3xl mx-auto">
            {/* Progress Indicator */}
            <div className="p-5 lg:p-8 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`flex items-center space-x-2 ${currentStep === 'insurance' || insuranceProvider ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${insuranceProvider ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    {insuranceProvider ? '✓' : '1'}
                  </div>
                  <span className="text-sm font-semibold">Insurance</span>
                </div>
                <div className="flex-1 h-1 bg-gray-200 mx-4">
                  <div className={`h-full bg-blue-600 transition-all ${insuranceProvider ? 'w-full' : 'w-0'}`}></div>
                </div>
                <div className={`flex items-center space-x-2 ${currentStep === 'needs' || healthcareNeeds ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${healthcareNeeds ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    {healthcareNeeds ? '✓' : '2'}
                  </div>
                  <span className="text-sm font-semibold">Your Needs</span>
                </div>
              </div>

              {/* Question Display */}
              <div className="text-center">
                <h3 className="text-lg lg:text-xl font-extrabold text-gray-900 mb-2">
                  {currentStep === 'insurance' 
                    ? 'What is your insurance provider?' 
                    : currentStep === 'needs'
                    ? 'Describe your healthcare needs'
                    : 'Finding providers for you...'
                  }
                </h3>
                <p className="text-sm text-gray-600">
                  {currentStep === 'insurance' 
                    ? 'e.g., Blue Cross Blue Shield, Medicaid, Excellus' 
                    : currentStep === 'needs'
                    ? 'e.g., I need a primary care doctor for annual checkup'
                    : 'Redirecting to directory...'
                  }
                </p>
              </div>

              {/* Show previous answers */}
              {insuranceProvider && currentStep !== 'insurance' && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Insurance:</strong> {insuranceProvider}
                  </p>
                </div>
              )}
            </div>
            
            {/* Chat Input Form */}
            {currentStep !== 'complete' && (
              <form onSubmit={handleSendMessage} className="p-5 lg:p-8">
                <div className="relative">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={currentStep === 'insurance' 
                      ? "Enter your insurance provider name..." 
                      : "Describe what kind of healthcare provider you need..."
                    }
                    className="w-full px-4 py-4 pr-14 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-700 text-sm lg:text-base font-medium"
                    rows={3}
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
                    className="absolute bottom-3 right-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-2.5 rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <PaperAirplaneIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Loading state */}
            {currentStep === 'complete' && (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Finding the best providers for you...</p>
              </div>
            )}
          </div>

          {/* Mobile Medical Illustration - Only visible on mobile */}
          <div className="lg:hidden relative h-64 overflow-hidden mb-5 bg-gradient-to-br from-blue-50 to-cyan-50 -mx-4">
            <Image
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80"
              alt="Healthcare professionals"
              fill
              className="object-cover"
            />
          </div>

          {/* Prompt Slider */}
          <div className="max-w-5xl mx-auto">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">
              Quick Prompts
            </p>
            <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
              <div className="flex space-x-3 pb-2">
                {suggestedPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePromptClick(prompt.text)}
                    className={`flex-shrink-0 w-64 lg:w-80 text-left p-4 bg-gradient-to-r ${prompt.color} hover:opacity-90 rounded-xl transition-all border-0 shadow-md`}
                  >
                    <p className="text-white text-sm lg:text-base font-semibold">{prompt.text}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Featured Provider Card */}
        <div 
          onClick={() => router.push('/directory')}
          className="relative rounded-2xl overflow-hidden mb-6 shadow-xl cursor-pointer transform transition-transform hover:scale-[1.02] max-w-4xl mx-auto"
        >
          {/* Background Image */}
          <div className="relative h-56 lg:h-72">
            <Image 
              src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80" 
              alt="Hospital"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/80 via-purple-600/80 to-pink-500/80"></div>
            
            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col justify-between p-6 lg:p-8 text-white">
              {/* Top Badge */}
              <div className="flex justify-between items-start">
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs lg:text-sm font-bold">
                  ⭐ 5.0 Featured Provider
                </div>
              </div>

              {/* Bottom Content */}
              <div>
                <h3 className="text-2xl lg:text-4xl font-extrabold mb-2 tracking-tight">
                  Upstate University Hospital
                </h3>
                <p className="text-white/90 text-sm lg:text-base font-medium mb-3">
                  Emergency Care • Trauma Center • Top Rated
                </p>
                <div className="inline-block bg-white text-purple-600 px-5 py-2 rounded-full text-sm lg:text-base font-bold">
                  Learn More →
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Card */}
        <div className="bg-white rounded-2xl overflow-hidden mb-6 border-2 border-gray-200 shadow-sm max-w-4xl mx-auto">
          <div className="p-6 lg:p-8">
            <div className="flex items-center space-x-2 mb-3">
              <ShieldCheckIcon className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600" />
              <span className="text-xs lg:text-sm font-bold uppercase tracking-wider text-blue-600">Insurance Match</span>
            </div>
            <h3 className="text-xl lg:text-2xl font-extrabold mb-2 text-blue-600 tracking-tight">
              Finding providers accepting your insurance
            </h3>
            <p className="text-sm lg:text-base text-gray-600 mb-4 font-medium">
              Search by plan and specialty
            </p>
            <button 
              onClick={() => router.push('/directory')}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-full text-sm lg:text-base font-bold hover:bg-blue-700 transition-colors shadow-md"
            >
              Explore →
            </button>
          </div>
        </div>

        {/* Quick Searches */}
        <div className="mb-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg lg:text-xl font-extrabold text-gray-900 tracking-tight">Quick Searches</h3>
            <button 
              onClick={() => router.push('/directory')}
              className="text-sm lg:text-base font-bold text-primary-600"
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
                  className="flex-shrink-0 px-5 py-2 bg-white rounded-full border border-gray-200 text-sm lg:text-base font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 lg:p-8 text-white shadow-lg max-w-4xl mx-auto">
          <HeartIcon className="h-8 w-8 lg:h-10 lg:w-10 mb-3" />
          <h3 className="text-xl lg:text-2xl font-extrabold mb-2 tracking-tight">
            Quality care starts here
          </h3>
          <p className="text-sm lg:text-base text-blue-100 mb-4 font-medium">
            Browse verified providers in Central New York
          </p>
          <button 
            onClick={() => router.push('/directory')}
            className="text-sm lg:text-base font-bold text-white border-2 border-white px-5 py-2 rounded-full hover:bg-white hover:text-blue-600 transition-colors"
          >
            Learn More
          </button>
        </div>
      </div>
    </div>
  )
}