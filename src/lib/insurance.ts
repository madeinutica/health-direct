export interface InsuranceInfo {
  provider: {
    id: string
    name: string
    type: 'commercial' | 'medicaid' | 'medicare'
  }
  plan?: string
}

export function getUserInsurance(): InsuranceInfo | null {
  if (typeof window === 'undefined') return null
  
  const savedInsurance = localStorage.getItem('userInsurance')
  if (savedInsurance) {
    try {
      return JSON.parse(savedInsurance)
    } catch {
      return null
    }
  }
  return null
}

export function saveUserInsurance(insurance: InsuranceInfo): void {
  if (typeof window === 'undefined') return
  
  localStorage.setItem('userInsurance', JSON.stringify(insurance))
}

export function clearUserInsurance(): void {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem('userInsurance')
}

// This function would be used throughout the app to filter providers by insurance
export function isProviderInNetwork(provider: any, userInsurance: InsuranceInfo | null): boolean {
  if (!userInsurance) return true // Show all providers if no insurance is set
  
  // In a real app, this would check against a database of in-network providers
  // For now, we'll simulate some basic logic
  
  const providerAcceptsInsurance = (provider: any, insuranceType: string): boolean => {
    // Mock logic - in real app, this would come from provider data
    const acceptanceMap: Record<string, string[]> = {
      'fidelis': ['Hospital', 'MedicalClinic', 'MedicalCenter'],
      'excellus': ['Hospital', 'MedicalClinic', 'Physician'],
      'aetna': ['Hospital', 'MedicalClinic', 'MedicalCenter'],
      'medicaid': ['Hospital', 'MedicalClinic', 'CommunityHealth'],
      'medicare': ['Hospital', 'MedicalClinic', 'Physician']
    }
    
    return acceptanceMap[insuranceType]?.includes(provider.type) ?? true
  }
  
  return providerAcceptsInsurance(provider, userInsurance.provider.id)
}