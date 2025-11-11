import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function importHealthcareProviders() {
  try {
    console.log('🏥 Starting healthcare provider import...')

    // Read the JSON file
    const dataPath = join(process.cwd(), 'data', 'healthcare_providers.json')
    const jsonData = readFileSync(dataPath, 'utf8')
    const providers = JSON.parse(jsonData)

    console.log(`📊 Found ${providers.length} providers to import`)

    // Clear existing data (optional - remove this if you want to keep existing data)
    console.log('🧹 Clearing existing provider data...')
    const { error: deleteError } = await supabase
      .from('healthcare_providers')
      .delete()
      .gt('created_at', '1900-01-01') // This will delete all records

    if (deleteError) {
      console.warn('⚠️ Could not clear existing data:', deleteError.message)
    }

    // Import providers one by one to handle any errors gracefully
    let successCount = 0
    let errorCount = 0
    const importedProviders: any[] = []

    for (const provider of providers) {
      try {
        // Transform the data to match our database schema
        const providerData = {
          name: provider.name,
          type: provider.type,
          description: provider.description,
          address: provider.address,
          telephone: [provider.telephone], // Convert to array
          website: provider.website,
          email: provider.email,
          medical_specialty: provider.medicalSpecialty,
          service_type: provider.serviceType,
          is_emergency: provider.isEmergency,
          is_24_hours: provider.is24Hours,
          accepts_insurance: provider.acceptsInsurance,
          languages_spoken: provider.languagesSpoken,
          // Set default values for fields not in JSON
          rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // Random rating 3.0-5.0
          review_count: Math.floor(Math.random() * 100) + 10, // Random review count 10-110
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
        await new Promise(resolve => setTimeout(resolve, 100))

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
      console.log('\n🎉 Healthcare provider import completed successfully!')
      console.log('You can now view the providers in your Supabase dashboard and in the application.')
    }

    return importedProviders

  } catch (error) {
    console.error('💥 Fatal error during import:', error)
    process.exit(1)
  }
}

// Add some sample users and reviews as well
async function importSampleData(providers: any[]) {
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
      }
    ]

    const insertedUsers: any[] = []

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
    const wynnProvider = providers.find(p => p.name.includes('Wynn'))
    const johnsonProvider = providers.find(p => p.name.includes('Dr. Sarah Johnson'))
    
    if (insertedUsers.length > 0 && (wynnProvider || johnsonProvider)) {
      const sampleReviews = []
      
      if (wynnProvider && insertedUsers[0]) {
        sampleReviews.push({
          provider_id: wynnProvider.generatedId,
          user_id: insertedUsers[0].id,
          rating: 5,
          title: 'Excellent Emergency Care',
          content: 'The staff at Wynn Hospital provided exceptional care during my emergency visit. Professional, compassionate, and efficient service.',
          is_anonymous: false,
          is_verified: true,
          visit_date: '2024-10-15'
        })
      }
      
      if (johnsonProvider && insertedUsers[1]) {
        sampleReviews.push({
          provider_id: johnsonProvider.generatedId,
          user_id: insertedUsers[1].id,
          rating: 5,
          title: 'Great Family Doctor',
          content: 'Dr. Johnson is an excellent family physician. She takes time to listen and provides thorough care for my whole family.',
          is_anonymous: false,
          is_verified: true,
          visit_date: '2024-11-01'
        })
      }

      for (const review of sampleReviews) {
        const { error } = await supabase.from('reviews').insert([review])
        if (error) {
          console.warn(`⚠️ Could not insert review:`, error.message)
        } else {
          console.log(`✅ Added review for provider`)
        }
      }
    } else {
      console.log('⚠️ Skipping reviews - no users or providers available')
    }

  } catch (error) {
    console.warn('⚠️ Error importing sample data:', error)
  }
}

// Run the import
async function main() {
  console.log('🚀 Starting HealthDirect data import...\n')
  
  const importedProviders = await importHealthcareProviders()
  await importSampleData(importedProviders)
  
  console.log('\n🎊 Data import process completed!')
  console.log('Check your Supabase dashboard to verify the imported data.')
}

main().catch(console.error)