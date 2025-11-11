'use client'

import { useState } from 'react'
import { InsuranceSelection } from './InsuranceProvider'
import { ShieldCheckIcon, PlusIcon } from '@heroicons/react/24/outline'

interface InsuranceInfo {
  provider: {
    id: string
    name: string
    type: 'commercial' | 'medicaid' | 'medicare'
  }
  plan?: string
}

export function MyHealthProvider() {
  const [showInsuranceModal, setShowInsuranceModal] = useState(false)
  const [insurance, setInsurance] = useState<InsuranceInfo | null>(null)

  const handleSaveInsurance = (provider: any, plan?: string) => {
    setInsurance({
      provider: {
        id: provider.id,
        name: provider.name,
        type: provider.type
      },
      plan
    })
    setShowInsuranceModal(false)
    
    // In a real app, you would save this to local storage or a database
    localStorage.setItem('userInsurance', JSON.stringify({
      provider: {
        id: provider.id,
        name: provider.name,
        type: provider.type
      },
      plan
    }))
  }

  // Load insurance from localStorage on component mount
  useState(() => {
    const savedInsurance = localStorage.getItem('userInsurance')
    if (savedInsurance) {
      setInsurance(JSON.parse(savedInsurance))
    }
  })

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">My Health Provider</h2>
          {insurance && (
            <button
              onClick={() => setShowInsuranceModal(true)}
              className="text-primary-600 text-sm font-medium hover:text-primary-700"
            >
              Change
            </button>
          )}
        </div>

        {insurance ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <ShieldCheckIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{insurance.provider.name}</h3>
                {insurance.plan && (
                  <p className="text-sm text-gray-600">{insurance.plan}</p>
                )}
                <p className="text-xs text-gray-500 capitalize">
                  {insurance.provider.type} {insurance.provider.type === 'commercial' ? 'Insurance' : 'Program'}
                </p>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-700 font-medium">
                ✓ In-network filter enabled across the app
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheckIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Add your insurance</h3>
            <p className="text-gray-600 text-sm mb-4">
              Get personalized in-network provider recommendations
            </p>
            <button
              onClick={() => setShowInsuranceModal(true)}
              className="inline-flex items-center space-x-2 bg-primary-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Add Insurance</span>
            </button>
          </div>
        )}
      </div>

      {showInsuranceModal && (
        <InsuranceSelection
          onSave={handleSaveInsurance}
          onClose={() => setShowInsuranceModal(false)}
        />
      )}
    </>
  )
}