'use client'

import { useState, Suspense } from 'react'
import { PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/outline'
import DirectorySearch from '@/components/DirectorySearch'

function DirectoryContent() {
  const [chatInput, setChatInput] = useState('')
  const [showChatGuidance, setShowChatGuidance] = useState(true)

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    // Here you would integrate with your chat API
    console.log('Processing guidance request:', chatInput)
    
    // For now, just show the guidance interface
    setShowChatGuidance(true)
  }

  const guidancePrompts = [
    "Narrow down by specialty (e.g., 'Show me cardiologists')",
    "Filter by insurance (e.g., 'Which accept Excellus?')",
    "Find nearby providers (e.g., 'Providers within 10 miles')",
    "Check availability (e.g., 'Who has appointments this week?')",
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Chat Guidance Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-4 mx-auto max-w-7xl">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-3 mb-4">
              <SparklesIcon className="h-6 w-6 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">AI Assistant</h2>
            </div>
            
            {/* Chat Input */}
            <form onSubmit={handleChatSubmit} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask me to help refine your search or find the perfect provider..."
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-700"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <PaperAirplaneIcon className="h-4 w-4" />
                </button>
              </div>
            </form>

            {/* Quick Guidance Options */}
            {showChatGuidance && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {guidancePrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setChatInput(prompt.split("'")[1] || prompt)}
                    className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 text-sm"
                  >
                    <span className="text-primary-600 font-medium">💡</span> {prompt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="px-4 py-4 text-center mx-auto max-w-7xl">
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            Healthcare Directory
          </h1>
          <p className="text-sm text-gray-600">
            Find providers in Central New York
          </p>
        </div>
      </div>

      {/* Directory Search Component */}
      <DirectorySearch />
    </div>
  )
}

export default function DirectoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading directory...</p>
        </div>
      </div>
    }>
      <DirectoryContent />
    </Suspense>
  )
}