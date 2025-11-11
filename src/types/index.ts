export interface Address {
  streetAddress?: string
  addressLocality: string
  addressRegion: string
  postalCode?: string
}

export interface HealthcareProvider {
  id: string
  type: 'Hospital' | 'MedicalClinic' | 'MedicalCenter' | 'Physician' | 'MedicalLaboratory' | 'HealthAndBeautyBusiness'
  name: string
  description?: string
  address: Address | Address[]
  latitude?: number
  longitude?: number
  geocodingAccuracy?: string
  geocodedAddress?: string
  telephone?: string | string[]
  website?: string
  email?: string
  parentOrganization?: {
    name: string
    type?: string
  }
  medicalSpecialty?: string[]
  serviceType?: string[]
  hasPOS?: Array<{
    type: string
    name: string
    description?: string
  }>
  specialty?: string
  rating?: number
  reviewCount?: number
  isEmergency?: boolean
  is24Hours?: boolean
  acceptsInsurance?: string[]
  languagesSpoken?: string[]
  createdAt?: string
  updatedAt?: string
}

export interface Review {
  id: string
  providerId: string
  userId: string
  rating: number
  title: string
  content: string
  isAnonymous: boolean
  isVerified: boolean
  visitDate?: string
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  avatarUrl?: string
  location?: string
  joinedAt: string
  isVerified: boolean
}

export interface CommunityPost {
  id: string
  userId: string
  title: string
  content: string
  category: 'question' | 'recommendation' | 'experience' | 'general'
  tags?: string[]
  likeCount: number
  replyCount: number
  createdAt: string
  updatedAt: string
}

export interface PostReply {
  id: string
  postId: string
  userId: string
  content: string
  parentReplyId?: string
  likeCount: number
  createdAt: string
  updatedAt: string
}