import type { Provider, ProcessedProvider, Address } from './types';

export function categorizeProvider(type: string, specialties: string[]): string {
  if (type === 'Hospital') return 'Hospital';
  
  const specialtyStr = specialties.join(' ').toLowerCase();
  
  // Priority categories for quick access
  if (specialtyStr.includes('urgent care')) return 'Urgent Care';
  if (specialtyStr.includes('emergency')) return 'Emergency';
  
  // Specialist categories (most important for users)
  if (specialtyStr.includes('maternity') || specialtyStr.includes('obstetrics') || specialtyStr.includes('ob') || specialtyStr.includes('prenatal') || specialtyStr.includes('women')) return 'Maternity & Women\'s Health';
  if (specialtyStr.includes('ent') || specialtyStr.includes('ear') || specialtyStr.includes('nose') || specialtyStr.includes('throat') || specialtyStr.includes('allergy')) return 'ENT & Allergy';
  if (specialtyStr.includes('cardiology') || specialtyStr.includes('heart') || specialtyStr.includes('cardiac')) return 'Cardiology & Heart Care';
  if (specialtyStr.includes('orthopedic') || specialtyStr.includes('bone') || specialtyStr.includes('joint') || specialtyStr.includes('spine')) return 'Orthopedics & Bone Care';
  if (specialtyStr.includes('mental health') || specialtyStr.includes('behavioral health') || specialtyStr.includes('psychiatry') || specialtyStr.includes('counseling') || specialtyStr.includes('addiction')) return 'Mental Health & Behavioral';
  if (specialtyStr.includes('cancer') || specialtyStr.includes('oncology') || specialtyStr.includes('hematology') || specialtyStr.includes('radiation')) return 'Cancer Care & Oncology';
  if (specialtyStr.includes('gastro') || specialtyStr.includes('digestive') || specialtyStr.includes('gi ') || specialtyStr.includes('endoscopy')) return 'Gastroenterology';
  if (specialtyStr.includes('neurology') || specialtyStr.includes('brain') || specialtyStr.includes('neurosurgery')) return 'Neurology & Brain Care';
  if (specialtyStr.includes('pulmonary') || specialtyStr.includes('lung') || specialtyStr.includes('respiratory')) return 'Pulmonary & Lung Care';
  if (specialtyStr.includes('dermatology') || specialtyStr.includes('skin')) return 'Dermatology & Skin Care';
  if (specialtyStr.includes('urology') || specialtyStr.includes('urological')) return 'Urology';
  if (specialtyStr.includes('pediatric') || specialtyStr.includes('child') || specialtyStr.includes('baby')) return 'Pediatrics & Child Care';
  
  // General categories
  if (specialtyStr.includes('surgery') || specialtyStr.includes('surgical')) return 'Surgery';
  if (specialtyStr.includes('imaging') || specialtyStr.includes('x-ray') || specialtyStr.includes('laboratory') || specialtyStr.includes('radiology')) return 'Imaging & Lab';
  if (specialtyStr.includes('therapy') || specialtyStr.includes('rehabilitation')) return 'Therapy & Rehabilitation';
  if (specialtyStr.includes('primary care') || specialtyStr.includes('family medicine') || specialtyStr.includes('family practice')) return 'Primary Care';
  
  return 'Other Specialists';
}

export function getLocation(address: Address | Address[] | undefined): string {
  if (!address) return 'Oneida County';
  const addr = Array.isArray(address) ? address[0] : address;
  return addr?.addressLocality || 'Oneida County';
}

export function formatAddress(address: Address | Address[] | undefined): string {
  if (!address) return 'Address not available';
  const addr = Array.isArray(address) ? address[0] : address;
  if (!addr) return 'Address not available';
  const parts = [
    addr.streetAddress,
    addr.addressLocality,
    addr.addressRegion,
    addr.postalCode
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'Address not available';
}

export function formatPhone(phone: string | string[] | undefined): string {
  if (!phone) return '';
  return Array.isArray(phone) ? phone[0] : phone;
}

export function processProviders(providers: Provider[]): ProcessedProvider[] {
  return providers.map((provider, index) => {
    const specialties = provider.medicalSpecialty || [];
    const services = [
      ...(provider.serviceType || []),
      ...(provider.hasPOS?.map(s => s.name) || [])
    ];
    
    return {
      id: `provider-${index}`,
      name: provider.name,
      type: provider["@type"],
      category: categorizeProvider(provider["@type"], specialties),
      location: getLocation(provider.address),
      address: formatAddress(provider.address),
      phone: formatPhone(provider.telephone),
      specialties,
      services,
      website: provider.sameAs,
      organization: provider.parentOrganization?.name,
      acceptsInsurance: provider.acceptsInsurance,
      network: provider.network,
      acceptsMedicaid: provider.acceptsMedicaid,
      acceptsMedicare: provider.acceptsMedicare
    };
  });
}

export function getUniqueLocations(providers: ProcessedProvider[]): string[] {
  const locations = providers.map(p => p.location);
  return ['All', ...Array.from(new Set(locations)).sort()];
}

export function getUniqueCategories(providers: ProcessedProvider[]): string[] {
  const categories = providers.map(p => p.category);
  return Array.from(new Set(categories)).sort();
}

export function getCategoryCounts(providers: ProcessedProvider[]): Record<string, number> {
  const counts: Record<string, number> = {};
  providers.forEach(p => {
    counts[p.category] = (counts[p.category] || 0) + 1;
  });
  return counts;
}

export function getLocationCounts(providers: ProcessedProvider[]): Record<string, number> {
  const counts: Record<string, number> = {};
  providers.forEach(p => {
    counts[p.location] = (counts[p.location] || 0) + 1;
  });
  return counts;
}

export function filterProviders(
  providers: ProcessedProvider[],
  searchTerm: string,
  category: string,
  location: string
): ProcessedProvider[] {
  return providers.filter(provider => {
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        provider.name.toLowerCase().includes(term) ||
        provider.specialties.some(s => s.toLowerCase().includes(term)) ||
        provider.services.some(s => s.toLowerCase().includes(term)) ||
        provider.category.toLowerCase().includes(term);
      
      if (!matchesSearch) return false;
    }
    
    // Category filter
    if (category !== 'All' && provider.category !== category) {
      return false;
    }
    
    // Location filter
    if (location !== 'All' && provider.location !== location) {
      return false;
    }
    
    return true;
  });
}
