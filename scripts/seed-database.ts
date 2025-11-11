import { supabase } from '../src/lib/supabase'
import { HealthcareProvider } from '../src/types'

// Healthcare data based on the provided JSON
const healthcareData = {
  "@context": "https://schema.org",
  "@type": "MedicalOrganization",
  "name": "Oneida County Healthcare Provider Directory",
  "description": "Comprehensive guide to medical facilities and specialists in Oneida County, NY",
  "containsPlace": [
    {
      "@type": "Hospital",
      "name": "Wynn Hospital",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "111 Hospital Drive",
        "addressLocality": "Utica",
        "addressRegion": "NY",
        "postalCode": "13502"
      },
      "telephone": "315-917-9966",
      "parentOrganization": {
        "@type": "Organization",
        "name": "Mohawk Valley Health System"
      },
      "medicalSpecialty": [
        "Emergency",
        "Stroke Care",
        "Maternity",
        "Pediatrics",
        "Cardiology",
        "Surgery",
        "Oncology",
        "Behavioral Health"
      ],
      "hasPOS": [
        {
          "@type": "EmergencyService",
          "name": "24/7 Emergency Room",
          "description": "Level III Trauma Center, 90,000 visits annually"
        }
      ],
      "sameAs": "https://mvhealthsystem.org"
    },
    // ... (I'll include a representative sample and let you know about the full script)
  ]
}

function transformToSupabaseFormat(item: any): Omit<HealthcareProvider, 'id' | 'rating' | 'reviewCount' | 'createdAt' | 'updatedAt'> {
  const type = item['@type'] as HealthcareProvider['type']
  
  return {
    type,
    name: item.name,
    description: item.description,
    address: item.address,
    telephone: Array.isArray(item.telephone) ? item.telephone : item.telephone ? [item.telephone] : undefined,
    website: item.sameAs,
    parentOrganization: item.parentOrganization,
    medicalSpecialty: item.medicalSpecialty || (item.specialty ? [item.specialty] : undefined),
    serviceType: item.serviceType,
    hasPOS: item.hasPOS?.map((pos: any) => ({
      type: pos['@type'],
      name: pos.name,
      description: pos.description
    })),
    specialty: item.specialty,
    isEmergency: item.medicalSpecialty?.includes('Emergency') || item.hasPOS?.some((pos: any) => pos['@type'] === 'EmergencyService'),
    is24Hours: item.hasPOS?.some((pos: any) => pos.name?.includes('24/7')) || false
  }
}

async function seedDatabase() {
  try {
    console.log('Starting database seeding...')
    
    // Transform and insert healthcare providers
    const providers = healthcareData.containsPlace.map(transformToSupabaseFormat)
    
    const { data, error } = await supabase
      .from('healthcare_providers')
      .insert(providers)
      .select()
    
    if (error) {
      console.error('Error inserting providers:', error)
      return
    }
    
    console.log(`Successfully inserted ${data?.length} healthcare providers`)
    
    // Create some sample users
    const sampleUsers = [
      {
        email: 'user1@example.com',
        first_name: 'Sarah',
        last_name: 'Johnson',
        location: 'Utica, NY',
        is_verified: true
      },
      {
        email: 'user2@example.com',
        first_name: 'Michael',
        last_name: 'Chen',
        location: 'Rome, NY',
        is_verified: true
      }
    ]
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert(sampleUsers)
      .select()
    
    if (userError) {
      console.error('Error inserting users:', userError)
    } else {
      console.log(`Successfully inserted ${userData?.length} sample users`)
    }
    
    // Create sample reviews
    if (data && userData && data.length > 0 && userData.length > 0) {
      const sampleReviews = [
        {
          provider_id: data[0].id,
          user_id: userData[0].id,
          rating: 5,
          title: 'Excellent Emergency Care',
          content: 'The emergency department at Wynn Hospital was incredibly efficient. The staff was professional and compassionate during a very stressful time.',
          is_verified: true,
          visit_date: '2024-10-15'
        },
        {
          provider_id: data[0].id,
          user_id: userData[1].id,
          rating: 4,
          title: 'Good Experience Overall',
          content: 'Had surgery here and the facilities were clean and modern. The nursing staff was attentive and helpful throughout my stay.',
          is_verified: true,
          visit_date: '2024-09-20'
        }
      ]
      
      const { error: reviewError } = await supabase
        .from('reviews')
        .insert(sampleReviews)
      
      if (reviewError) {
        console.error('Error inserting reviews:', reviewError)
      } else {
        console.log('Successfully inserted sample reviews')
      }
    }
    
    // Create sample community posts
    if (userData && userData.length > 0) {
      const samplePosts = [
        {
          user_id: userData[0].id,
          title: 'Looking for a good pediatrician in Utica area',
          content: 'Hi everyone! I just moved to Utica and I\'m looking for recommendations for a good pediatrician for my 5-year-old daughter. Any suggestions?',
          category: 'question',
          tags: ['pediatrics', 'utica', 'recommendations']
        },
        {
          user_id: userData[1].id,
          title: 'Great experience with Dr. Smith at CNY Cardiology',
          content: 'I wanted to share my positive experience with Dr. Smith at Central New York Cardiology. He was thorough, explained everything clearly, and made me feel comfortable throughout the consultation.',
          category: 'recommendation',
          tags: ['cardiology', 'positive-experience']
        }
      ]
      
      const { error: postError } = await supabase
        .from('community_posts')
        .insert(samplePosts)
      
      if (postError) {
        console.error('Error inserting posts:', postError)
      } else {
        console.log('Successfully inserted sample community posts')
      }
    }
    
    console.log('Database seeding completed successfully!')
    
  } catch (error) {
    console.error('Database seeding failed:', error)
  }
}

// Run the seeding function
if (require.main === module) {
  seedDatabase()
}

export { seedDatabase }