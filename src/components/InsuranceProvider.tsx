'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PlusIcon, XMarkIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid'

interface InsuranceProvider {
  id: string
  name: string
  type: 'commercial' | 'medicaid' | 'medicare'
  plans?: string[]
  marketShare?: string
  coverageArea?: string[]
}

interface InsuranceSelectionProps {
  onSave?: (provider: InsuranceProvider, plan?: string) => void
  onClose?: () => void
}

// Enhanced insurance data based on research
const commercialInsurers: InsuranceProvider[] = [
  { 
    id: 'fidelis', 
    name: 'Fidelis Care', 
    type: 'commercial', 
    marketShare: 'Largest Medicaid managed care plan in NY',
    coverageArea: ['Statewide'],
    plans: ['Essential Plan', 'Child Health Plus', 'Qualified Health Plan', 'Medicaid Managed Care', 'Medicare Advantage']
  },
  { 
    id: 'excellus', 
    name: 'Excellus BlueCross BlueShield', 
    type: 'commercial', 
    marketShare: 'Dominant commercial insurer in Upstate NY',
    coverageArea: ['Central NY', 'Finger Lakes', 'Western NY', 'North Country'],
    plans: ['PPO', 'HMO', 'EPO', 'HDHP', 'Medicare Supplement', 'Medicaid Managed Care']
  },
  { 
    id: 'aetna', 
    name: 'Aetna (CVS Health)', 
    type: 'commercial', 
    marketShare: 'National provider with significant Upstate NY presence',
    coverageArea: ['Statewide', 'National network'],
    plans: ['PPO', 'HMO', 'Open Access', 'Choice POS', 'Medicare Advantage']
  },
  { 
    id: 'united', 
    name: 'UnitedHealthcare', 
    type: 'commercial', 
    marketShare: 'Largest health insurer nationally',
    coverageArea: ['Statewide', 'National network'],
    plans: ['Choice Plus', 'Options PPO', 'HMO', 'EPO', 'Medicare Advantage']
  },
  { 
    id: 'cigna', 
    name: 'Cigna', 
    type: 'commercial', 
    marketShare: 'Global health services company',
    coverageArea: ['Statewide', 'National network'],
    plans: ['Open Access Plus', 'HMO', 'PPO', 'LocalPlus', 'Medicare Advantage']
  },
  { 
    id: 'empire', 
    name: 'Empire BlueCross BlueShield', 
    type: 'commercial', 
    marketShare: 'Leading insurer in downstate NY with Upstate presence',
    coverageArea: ['Statewide'],
    plans: ['PPO', 'HMO', 'EPO', 'Pathway', 'Medicare Advantage']
  },
  { 
    id: 'independent', 
    name: 'Independent Health', 
    type: 'commercial', 
    marketShare: 'Western NY focused insurer',
    coverageArea: ['Western NY', 'Finger Lakes'],
    plans: ['HMO', 'PPO', 'EPO', 'Medicare Advantage']
  },
  { 
    id: 'univera', 
    name: 'Univera Healthcare', 
    type: 'commercial', 
    marketShare: 'Western NY focused insurer',
    coverageArea: ['Western NY'],
    plans: ['HMO', 'PPO', 'EPO', 'Medicare Advantage']
  }
]

export function InsuranceSelection({ onSave, onClose }: InsuranceSelectionProps) {
  const [selectedType, setSelectedType] = useState<'commercial' | 'medicaid' | 'medicare' | null>(null)
  const [selectedProvider, setSelectedProvider] = useState<InsuranceProvider | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showProviderInfo, setShowProviderInfo] = useState<string | null>(null)

  const filteredInsurers = commercialInsurers.filter(insurer =>
    insurer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    insurer.marketShare?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSave = () => {
    if (selectedProvider) {
      onSave?.(selectedProvider, selectedPlan || undefined)
    } else if (selectedType === 'medicaid' || selectedType === 'medicare') {
      onSave?.({ 
        id: selectedType, 
        name: selectedType === 'medicaid' ? 'Medicaid' : 'Medicare', 
        type: selectedType,
        marketShare: selectedType === 'medicaid' ? 'New York State Medicaid program' : 'Federal Medicare program'
      })
    }
  }

  const resetSelection = () => {
    setSelectedType(null)
    setSelectedProvider(null)
    setSelectedPlan('')
    setSearchQuery('')
    setShowProviderInfo(null)
  }

  const getProviderInfo = (provider: InsuranceProvider) => (
    <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm">
      <div className="font-medium text-blue-900 mb-1">Coverage Info:</div>
      {provider.marketShare && (
        <div className="text-blue-700">📊 {provider.marketShare}</div>
      )}
      {provider.coverageArea && (
        <div className="text-blue-700">📍 Covers: {provider.coverageArea.join(', ')}</div>
      )}
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {selectedProvider ? 'Select Plan' : selectedType ? 'Select Provider' : 'Add Insurance'}
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="h-6 w-6 text-gray-400" />
            </button>
          </div>

          {/* Back button when in sub-selection */}
          {(selectedType || selectedProvider) && (
            <button
              onClick={resetSelection}
              className="flex items-center text-primary-600 font-medium mb-4"
            >
              ← Back
            </button>
          )}

          {/* Initial Selection */}
          {!selectedType && !selectedProvider && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">I have...</h3>
                <p className="text-gray-600 text-sm mb-4">Select your insurance type</p>
              </div>

              <div className="grid gap-3">
                <button
                  onClick={() => setSelectedType('commercial')}
                  className="p-4 border-2 border-gray-200 rounded-xl text-left hover:border-primary-500 hover:bg-primary-50 transition-colors"
                >
                  <div className="font-semibold text-gray-900">Commercial Insurance</div>
                  <div className="text-sm text-gray-600">Aetna, BlueCross, UnitedHealthcare, etc.</div>
                </button>

                <button
                  onClick={() => setSelectedType('medicaid')}
                  className="p-4 border-2 border-gray-200 rounded-xl text-left hover:border-primary-500 hover:bg-primary-50 transition-colors"
                >
                  <div className="font-semibold text-gray-900">Medicaid</div>
                  <div className="text-sm text-gray-600">New York State Medicaid program</div>
                  <div className="text-xs text-blue-600 mt-1">Covers low-income individuals and families</div>
                </button>

                <button
                  onClick={() => setSelectedType('medicare')}
                  className="p-4 border-2 border-gray-200 rounded-xl text-left hover:border-primary-500 hover:bg-primary-50 transition-colors"
                >
                  <div className="font-semibold text-gray-900">Medicare</div>
                  <div className="text-sm text-gray-600">Federal Medicare program</div>
                  <div className="text-xs text-blue-600 mt-1">For seniors 65+ and people with disabilities</div>
                </button>
              </div>

              {/* Help Text */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <InformationCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <strong>Why this matters:</strong> We'll use this to show you providers that accept your insurance and help you avoid surprise bills.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Commercial Insurance Search */}
          {selectedType === 'commercial' && !selectedProvider && (
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search insurance companies (Fidelis, Excellus, Aetna...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 极 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 极 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredInsurers.map((insurer) => (
                  <div key={insurer.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setSelectedProvider(insurer)}
                      className="w-full p-3 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium text-gray-900">{insurer.name}</div>
                      {insurer.marketShare && (
                        <div className="text-sm text-gray-600">{insurer.marketShare}</div>
                      )}
                    </button>
                    
                    {showProviderInfo === insurer.id && getProviderInfo(insurer)}
                    
                    <button
                      onClick={() => setShowProviderInfo(showProviderInfo === insurer.id ? null : insurer.id)}
                      className="w-full p-2 bg-gray-100 text-xs text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      {showProviderInfo === insurer.id ? 'Hide details' : 'Show coverage details'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Plan Selection */}
          {selectedProvider && selectedProvider.plans && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Plan</h3>
                <p className="text-gray-600 text-sm">Choose your specific plan (optional - helps with accurate matching)</p>
              </div>

              <div className="space-y-2">
                {selectedProvider.plans.map((plan) => (
                  <button
                    key={plan}
                    onClick={() => setSelectedPlan(plan)}
                    className={`w-full p-3 text-left border rounded-lg transition-colors ${
                      selectedPlan === plan
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{plan}</span>
                      {selectedPlan === plan && (
                        <CheckCircleSolidIcon className="h-5 w-5 text-primary-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setSelectedPlan('')}
                className={`w-full p-3 text-left border rounded-lg transition-colors ${
                  selectedPlan === ''
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">I don't know my plan</span>
                  {selectedPlan === '' && (
                    <CheckCircleSolidIcon className="h-5 w-5 text-primary-600" />
                  )}
                </div>
              </button>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-sm text-blue-700">
                  <strong>Tip:</strong> Knowing your plan helps us find providers who are definitely in-network and accept your specific coverage.
                </div>
              </div>
            </div>
          )}

          {/* Medicaid/Medicare Confirmation */}
          {(selectedType === 'medicaid' || selectedType === 'medicare') && !selectedProvider && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {selectedType === 'medicaid' ? 'Medicaid' : 'Medicare'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {selectedType === 'medicaid' 
                    ? 'You\'ve selected New York State Medicaid'
                    : 'You\'ve selected Federal Medicare'
                  }
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="text-sm text-green-700">
                  {selectedType === 'medicaid' 
                    ? '✅ We\'ll show you providers who accept Medicaid patients'
                    : '✅ We\'ll show you providers who accept Medicare patients'
                  }
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          {(selectedType === 'medicaid' || selectedType === 'medicare' || selectedProvider) && (
            <button
              onClick={handleSave}
              className="w-full bg-primary-500 text-white py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors mt-6"
            >
              Save Insurance
            </button>
          )}
        </div>
      </div>
    </div>
  )
}