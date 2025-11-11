export interface Address {
  "@type": string;
  streetAddress?: string;
  addressLocality?: string;
  addressRegion?: string;
  postalCode?: string;
}

export interface Organization {
  "@type": string;
  name: string;
}

export interface Service {
  "@type": string;
  name: string;
  description?: string;
}

export interface Provider {
  "@type": string;
  name: string;
  address: Address | Address[];
  telephone?: string | string[];
  parentOrganization?: Organization;
  medicalSpecialty?: string[];
  serviceType?: string[];
  hasPOS?: Service[];
  sameAs?: string;
  acceptsInsurance?: string[];
  network?: string;
  acceptsMedicaid?: boolean;
  acceptsMedicare?: boolean;
}

export interface HealthcareData {
  "@context": string;
  "@type": string;
  name: string;
  description: string;
  address: Address;
  url: string;
  containsPlace: Provider[];
}

export interface ProcessedProvider {
  id: string;
  name: string;
  type: string;
  category: string;
  location: string;
  address: string;
  phone: string;
  specialties: string[];
  services: string[];
  website?: string;
  organization?: string;
  acceptsInsurance?: string[];
  network?: string;
  acceptsMedicaid?: boolean;
  acceptsMedicare?: boolean;
}
