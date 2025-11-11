const { createClient } = require('@supabase/supabase-js')
const { readFileSync } = require('fs')
const { join } = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Helper function to extract address from schema.org address object
function extractAddress(addressObj) {
  if (!addressObj) return {};
  
  // Handle single address or array of addresses
  const address = Array.isArray(addressObj) ? addressObj[0] : addressObj;
  
  // Return as JSON object instead of string
  return {
    streetAddress: address.streetAddress || '',
    addressLocality: address.addressLocality || '',
    addressRegion: address.addressRegion || '',
    postalCode: address.postalCode || ''
  };
}

// Helper function to extract phone number
function extractPhone(phoneObj) {
  if (!phoneObj) return '';
  return Array.isArray(phoneObj) ? phoneObj[0] : phoneObj;
}

// Helper function to extract specialties
function extractSpecialties(provider) {
  const specialties = [];
  
  // Check medicalSpecialty field
  if (provider.medicalSpecialty) {
    specialties.push(...provider.medicalSpecialty);
  }
  
  // Check specialty field (for Physician type)
  if (provider.specialty) {
    if (Array.isArray(provider.specialty)) {
      specialties.push(...provider.specialty);
    } else {
      specialties.push(provider.specialty);
    }
  }
  
  // Check serviceType field
  if (provider.serviceType) {
    specialties.push(...provider.serviceType);
  }
  
  return specialties.join(', ');
}

// Helper function to determine provider type from schema.org type
function getProviderType(schemaType) {
  switch (schemaType) {
    case 'Hospital':
      return 'Hospital';
    case 'MedicalClinic':
      return 'MedicalClinic';
    case 'MedicalCenter':
      return 'MedicalCenter';
    case 'Physician':
      return 'Physician';
    case 'MedicalLaboratory':
      return 'MedicalLaboratory';
    case 'HealthAndBeautyBusiness':
      return 'HealthAndBeautyBusiness';
    case 'Organization':
      return 'MedicalCenter'; // Map to allowed type
    case 'GovernmentOrganization':
      return 'MedicalCenter'; // Map to allowed type
    default:
      return 'MedicalClinic'; // Default fallback to allowed type
  }
}

async function importHealthcareProviders() {
  try {
    console.log('🏥 Starting CNY healthcare provider import...')

    // Read the schema.org JSON file
    const dataPath = join(process.cwd(), 'data', 'cnyhealth.json')
    const jsonData = readFileSync(dataPath, 'utf8')
    const schemaData = JSON.parse(jsonData)
    
    const providers = schemaData.containsPlace || []

    console.log(`📊 Found ${providers.length} providers to import`)

    // Clear existing data (optional - remove this if you want to keep existing data)
    console.log('🧹 Clearing existing provider data...')
    const { error: deleteError } = await supabase
      .from('healthcare_providers')
      .delete()
      .gt('created_at', '1900-01-01')

    if (deleteError) {
      console.warn('⚠️ Could not clear existing data:', deleteError.message)
    }

    // Import providers one by one to handle any errors gracefully
    let successCount = 0
    let errorCount = 0
    const importedProviders = []

    for (const provider of providers) {
      try {
        // Extract specialties and determine emergency status
        const specialties = extractSpecialties(provider);
        const isEmergency = specialties.toLowerCase().includes('emergency') || 
                           (provider.hasPOS && provider.hasPOS.some(pos => pos['@type'] === 'EmergencyService'));
        const is24Hours = isEmergency || provider.name.toLowerCase().includes('24/7') ||
                         (provider.hasPOS && provider.hasPOS.some(pos => pos.name?.includes('24/7')));

        // Transform the data to match our database schema
        const providerData = {
          name: provider.name,
          type: getProviderType(provider['@type']),
          description: provider.description || `${getProviderType(provider['@type'])} in ${extractAddress(provider.address)?.addressLocality || 'Oneida County'}`,
          address: extractAddress(provider.address), // Now returns JSON object
          telephone: extractPhone(provider.telephone) ? [extractPhone(provider.telephone)] : [], // Ensure array
          website: provider.sameAs || '',
          email: '', // Not provided in schema.org data
          medical_specialty: specialties ? [specialties] : [],
          service_type: provider.serviceType || [],
          is_emergency: isEmergency,
          is_24_hours: is24Hours,
          accepts_insurance: ['Most Insurance Plans'], // Default assumption
          languages_spoken: ['English'], // Default assumption
          // Set realistic values for fields not in JSON
          rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10, // Random rating 3.5-5.0
          review_count: Math.floor(Math.random() * 150) + 5, // Random review count 5-155
        }

        // Add parent organization info to description if available
        if (provider.parentOrganization?.name) {
          providerData.description += ` Part of ${provider.parentOrganization.name}.`;
        }

        const { data: insertedData, error } = await supabase
          .from('healthcare_providers')
          .insert([providerData])
          .select()

        if (error) {
          console.error(`❌ Error importing ${provider.name}:`, error.message)
          errorCount++
        } else {
          console.log(`✅ Successfully imported: ${provider.name}`)
          successCount++
          
          // Store the generated UUID for potential use in reviews
          if (insertedData && insertedData[0]) {
            provider.generatedId = insertedData[0].id
            importedProviders.push(provider)
          }
        }

        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 50))

      } catch (err) {
        console.error(`❌ Exception importing ${provider.name}:`, err)
        errorCount++
      }
    }

    console.log('\n📊 Import Summary:')
    console.log(`✅ Successfully imported: ${successCount} providers`)
    console.log(`❌ Failed to import: ${errorCount} providers`)
    console.log(`📈 Total processed: ${successCount + errorCount} providers`)

    if (successCount > 0) {
      console.log('\n🎉 CNY healthcare provider import completed successfully!')
    }

    return importedProviders

  } catch (error) {
    console.error('💥 Fatal error during import:', error)
    process.exit(1)
  }
}

// Add some sample users and reviews as well
async function importSampleData(providers) {
  try {
    console.log('\n👥 Importing sample users...')
    
    const sampleUsers = [
      {
        email: 'john.doe@example.com',
        first_name: 'John',
        last_name: 'Doe',
        location: 'Utica, NY',
        is_verified: true
      },
      {
        email: 'jane.smith@example.com',
        first_name: 'Jane',
        last_name: 'Smith',
        location: 'Rome, NY',
        is_verified: true
      },
      {
        email: 'mary.johnson@example.com',
        first_name: 'Mary',
        last_name: 'Johnson',
        location: 'Oneida, NY',
        is_verified: true
      }
    ]

    const insertedUsers = []

    for (const user of sampleUsers) {
      const { data, error } = await supabase.from('users').insert([user]).select()
      if (error) {
        console.warn(`⚠️ Could not insert user ${user.first_name}:`, error.message)
      } else {
        console.log(`✅ Added user: ${user.first_name} ${user.last_name}`)
        if (data && data[0]) {
          insertedUsers.push(data[0])
        }
      }
    }

    console.log('\n⭐ Importing sample reviews...')
    
    // Find some providers to review
    const wynnHospital = providers.find(p => p.name.includes('Wynn Hospital'))
    const wellNowUrgent = providers.find(p => p.name.includes('WellNow Urgent Care'))
    const oneidaHealth = providers.find(p => p.name.includes('Oneida Health Hospital'))
    const romeHealth = providers.find(p => p.name.includes('Rome Health Medical'))
    
    if (insertedUsers.length > 0) {
      const sampleReviews = []
      
      if (wynnHospital && insertedUsers[0]) {
        sampleReviews.push({
          provider_id: wynnHospital.generatedId,
          user_id: insertedUsers[0].id,
          rating: 5,
          title: 'Excellent Emergency Care at Wynn Hospital',
          content: 'The emergency department at Wynn Hospital provided exceptional care during my visit. The staff was professional, compassionate, and the facility is state-of-the-art. Highly recommend for emergency services.',
          is_anonymous: false,
          is_verified: true,
          visit_date: '2024-10-15'
        })
      }
      
      if (wellNowUrgent && insertedUsers[1]) {
        sampleReviews.push({
          provider_id: wellNowUrgent.generatedId,
          user_id: insertedUsers[1].id,
          rating: 4,
          title: 'Quick and Convenient Urgent Care',
          content: 'WellNow Urgent Care was perfect for my non-emergency medical needs. Short wait time, friendly staff, and they handled everything efficiently. Great alternative to the ER.',
          is_anonymous: false,
          is_verified: true,
          visit_date: '2024-11-01'
        })
      }

      if (oneidaHealth && insertedUsers[2]) {
        sampleReviews.push({
          provider_id: oneidaHealth.generatedId,
          user_id: insertedUsers[2].id,
          rating: 5,
          title: 'Outstanding Care at Oneida Health',
          content: 'The staff at Oneida Health Hospital provided excellent care during my recent procedure. The da Vinci robotic surgery was performed flawlessly, and recovery was smooth.',
          is_anonymous: false,
          is_verified: true,
          visit_date: '2024-10-20'
        })
      }

      if (romeHealth && insertedUsers[0]) {
        sampleReviews.push({
          provider_id: romeHealth.generatedId,
          user_id: insertedUsers[0].id,
          rating: 4,
          title: 'Good Experience at Rome Health',
          content: 'Rome Health Medical Center provided good care during my maternity visit. The facility is clean and the staff is knowledgeable. Would recommend for local residents.',
          is_anonymous: false,
          is_verified: true,
          visit_date: '2024-09-30'
        })
      }

      for (const review of sampleReviews) {
        const { error } = await supabase.from('reviews').insert([review])
        if (error) {
          console.warn(`⚠️ Could not insert review:`, error.message)
        } else {
          console.log(`✅ Added review for provider: ${review.title}`)
        }
      }
    } else {
      console.log('⚠️ Skipping reviews - no users available')
    }

  } catch (error) {
    console.warn('⚠️ Error importing sample data:', error)
  }
}

// Run the import
async function main() {
  console.log('🚀 Starting HealthDirect CNY data import...\n')
  
  const importedProviders = await importHealthcareProviders()
  await importSampleData(importedProviders)
  
  console.log('\n🎊 CNY healthcare data import process completed!')
  console.log('📈 Imported comprehensive Oneida County healthcare directory data')
  console.log('🏥 Includes hospitals, clinics, specialists, and support services')
  console.log('Check your Supabase dashboard to verify the imported data.')
  console.log('Visit your app at http://localhost:3001 to see the providers!')
}

main().catch(console.error)