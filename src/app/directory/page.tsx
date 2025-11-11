'use client'

import { useState, Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { PaperAirplaneIcon, SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline'
import DirectorySearch from '@/components/DirectorySearch'

function DirectoryContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('query') || ''
  const insuranceParam = searchParams.get('insurance') || ''
  const needsParam = searchParams.get('needs') || ''
  
  const [chatInput, setChatInput] = useState('')
  const [conversationHistory, setConversationHistory] = useState<Array<{ type: 'user' | 'assistant', content: string }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showChatModal, setShowChatModal] = useState(false)

  // Initialize conversation with homepage data
  useEffect(() => {
    if (insuranceParam && needsParam) {
      setConversationHistory([
        { type: 'assistant', content: `I see you have ${insuranceParam} insurance and you're looking for: ${needsParam}. Let me help you find the perfect provider. You can ask me to refine your search further!` }
      ])
    }
  }, [insuranceParam, needsParam])

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || isLoading) return

    const userMessage = chatInput.trim()
    setChatInput('')
    
    // Add user message
    const newHistory = [...conversationHistory, { type: 'user' as const, content: userMessage }]
    setConversationHistory(newHistory)
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          context: newHistory.slice(-5)
        })
      })

      if (response.ok) {
        const data = await response.json()
        setConversationHistory(prev => [...prev, { type: 'assistant', content: data.message }])
      } else {
        throw new Error('Failed to get response')
      }
    } catch (error) {
      console.error('Chat error:', error)
      setConversationHistory(prev => [...prev, { 
        type: 'assistant', 
        content: 'Sorry, I encountered an error. Please try refining your search using the filters below.' 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleChatSubmit(e as any)
    }
  }

  const guidancePrompts = [
    { text: "Show me specialists accepting my insurance", color: "from-blue-400 to-blue-500" },
    { text: "Find providers with same-day appointments", color: "from-purple-400 to-purple-500" },
    { text: "Which doctors are closest to me?", color: "from-pink-400 to-pink-500" },
    { text: "Show highly rated providers", color: "from-teal-400 to-teal-500" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Summary Header */}
      {insuranceParam && needsParam && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="px-4 py-6 lg:py-8 max-w-6xl mx-auto">
            <h1 className="text-2xl lg:text-3xl font-extrabold mb-2">
              Your Healthcare Provider Matches
            </h1>
            <p className="text-lg lg:text-xl text-blue-100 font-medium">
              I see you are in need of a <span className="font-bold text-white">{needsParam}</span> and you have <span className="font-bold text-white">{insuranceParam}</span> insurance. Here are your healthcare provider matches.
            </p>
          </div>
        </div>
      )}

      {/* Search Bar Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-16 lg:top-16 z-40">
        <div className="px-4 py-4 max-w-6xl mx-auto">
          <div className="flex items-center justify-between gap-4">
            {/* This will be replaced by DirectorySearch's search bar */}
            <div className="flex-1">
              <h2 className="text-lg font-extrabold text-gray-900 mb-2">
                Refine Your Search
              </h2>
            </div>
            
            {/* AI Assistant Button */}
            <button
              onClick={() => setShowChatModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full hover:from-blue-700 hover:to-blue-800 transition-all shadow-md font-semibold"
            >
              <SparklesIcon className="h-5 w-5" />
              <span className="hidden sm:inline">AI Assistant</span>
            </button>
          </div>
        </div>
      </div>

      {/* Directory Search Component with Results */}
      <DirectorySearch />

      {/* Chat Modal */}
      {showChatModal && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setShowChatModal(false)}
          ></div>

          {/* Modal */}
          <div className="absolute right-0 top-0 bottom-0 w-full sm:w-[480px] bg-white shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <SparklesIcon className="h-6 w-6" />
                <h2 className="text-xl font-extrabold">AI Assistant</h2>
              </div>
              <button
                onClick={() => setShowChatModal(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Context Summary */}
            {insuranceParam && needsParam && (
              <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
                <div className="text-sm space-y-1">
                  <div>
                    <span className="font-bold text-blue-900">Insurance:</span>
                    <span className="ml-2 text-blue-800">{insuranceParam}</span>
                  </div>
                  <div>
                    <span className="font-bold text-blue-900">Need:</span>
                    <span className="ml-2 text-blue-800">{needsParam}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Conversation History */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {conversationHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-4 py-3 ${
                      msg.type === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm font-medium whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-xl px-4 py-3">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Prompts */}
            <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Quick Actions
              </p>
              <div className="grid grid-cols-2 gap-2">
                {guidancePrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setChatInput(prompt.text)}
                    className={`text-left p-3 bg-gradient-to-r ${prompt.color} hover:opacity-90 rounded-lg transition-all border-0 shadow-sm`}
                  >
                    <p className="text-white text-xs font-semibold">{prompt.text}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Input */}
            <div className="px-6 py-4 border-t border-gray-200 bg-white">
              <form onSubmit={handleChatSubmit}>
                <div className="relative">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask me anything..."
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 font-medium"
                    disabled={isLoading}
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || isLoading}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-2 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <PaperAirplaneIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
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