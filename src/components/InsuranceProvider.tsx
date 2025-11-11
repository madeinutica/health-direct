'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PlusIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid'

interface InsuranceProvider {
  id: string
  name: string
  type: 'commercial' | 'medicaid' | 'medicare'
  plans?: string[]
}

interface InsuranceSelectionProps {
  onSave?: (provider: InsuranceProvider, plan?: string) => void
  onClose?: () => void
}

const commercialInsurers: InsuranceProvider[] = [
  { id: 'fidelis', name: 'Fidelis Care', type: 'commercial', plans: ['Essential Plan', 'Child Health Plus', 'Qualified Health Plan'] },
  { id: 'excellus', name: 'Excellus BlueCross BlueShield', type: 'commercial', plans: ['PPO', 'HMO', 'EPO', 'HDHP'] },
  { id: 'aetna', name: 'Aetna', type: 'commercial', plans: ['PPO', 'HMO', 'Open Access', 'Choice POS'] },
  { id: 'united', name: 'UnitedHealthcare', type: 'commercial', plans: ['Choice Plus', 'Options PPO', 'HMO', 'EPO'] },
  { id: 'cigna', name: 'Cigna', type: 'commercial', plans: ['Open Access Plus', 'HMO', 'PPO', 'LocalPlus'] },
  { id: 'empire', name: 'Empire BlueCross BlueShield', type: 'commercial', plans: ['PPO', 'HMO', 'EPO', 'Pathway'] }
]

export function InsuranceSelection({ onSave, onClose }: InsuranceSelectionProps) {
  const [selectedType, setSelectedType] = useState<'commercial' | 'medicaid' | 'medicare' | null>(null)
  const [selectedProvider, setSelectedProvider] = useState<InsuranceProvider | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredInsurers = commercialInsurers.filter(insurer =>
    insurer.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSave = () => {
    if (selectedProvider) {
      onSave?.(selectedProvider, selectedPlan || undefined)
    } else if (selectedType === 'medicaid' || selectedType === 'medicare') {
      onSave?.({ 
        id: selectedType, 
        name: selectedType === 'medicaid' ? 'Medicaid' : 'Medicare', 
        type: selectedType 
      })
    }
  }

  const resetSelection = () => {
    setSelectedType(null)
    setSelectedProvider(null)
    setSelectedPlan('')
    setSearchQuery('')
  }

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
                </button>

                <button
                  onClick={() => setSelectedType('medicare')}
                  className="p-4 border-2 border-gray-200 rounded-xl text-left hover:border-primary-500 hover:bg-primary-50 transition-colors"
                >
                  <div className="font-semibold text-gray-900">Medicare</div>
                  <div className="text-sm text-gray-600">Federal Medicare program</div>
                </button>
              </div>
            </div>
          )}

          {/* Commercial Insurance Search */}
          {selectedType === 'commercial' && !selectedProvider && (
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search insurance companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredInsurers.map((insurer) => (
                  <button
                    key={insurer.id}
                    onClick={() => setSelectedProvider(insurer)}
                    className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">{insurer.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Plan Selection */}
          {selectedProvider && selectedProvider.plans && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Plan</h3>
                <p className="text-gray-600 text-sm">Choose your specific plan (optional)</p>
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