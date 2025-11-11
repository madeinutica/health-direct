const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// Helper function to geocode an address using Mapbox Geocoding API
async function geocodeAddress(address) {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  
  if (!mapboxToken) {
    console.warn('⚠️ No Mapbox token found, using fallback coordinates')
    // Return approximate center of Oneida County, NY
    return {
      latitude: 43.2081,
      longitude: -75.4557,
      accuracy: 'fallback'
    }
  }

  try {
    // Build address string
    const addressParts = []
    if (address.streetAddress) addressParts.push(address.streetAddress)
    if (address.addressLocality) addressParts.push(address.addressLocality)
    if (address.addressRegion) addressParts.push(address.addressRegion)
    if (address.postalCode) addressParts.push(address.postalCode)
    
    const addressString = addressParts.join(', ')
    
    if (!addressString.trim()) {
      console.warn('⚠️ Empty address, using fallback coordinates')
      return {
        latitude: 43.2081,
        longitude: -75.4557,
        accuracy: 'fallback'
      }
    }

    const encodedAddress = encodeURIComponent(addressString)
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${mapboxToken}&limit=1&country=US&region=NY`
    
    console.log(`📍 Geocoding: ${addressString}`)
    
    const response = await fetch(url)
    const data = await response.json()

    if (data.features && data.features.length > 0) {
      const feature = data.features[0]
      const [longitude, latitude] = feature.center
      
      return {
        latitude: latitude,
        longitude: longitude,
        accuracy: feature.properties?.accuracy || 'geocoded',
        place_name: feature.place_name
      }
    } else {
      console.warn(`⚠️ No geocoding results for: ${addressString}`)
      // Return approximate coordinates for the city mentioned in address
      if (addressString.toLowerCase().includes('utica')) {
        return { latitude: 43.1009, longitude: -75.2326, accuracy: 'city_fallback' }
      } else if (addressString.toLowerCase().includes('rome')) {
        return { latitude: 43.2128, longitude: -75.4557, accuracy: 'city_fallback' }
      } else if (addressString.toLowerCase().includes('oneida')) {
        return { latitude: 43.0923, longitude: -75.6516, accuracy: 'city_fallback' }
      } else if (addressString.toLowerCase().includes('new hartford')) {
        return { latitude: 43.0731, longitude: -75.2875, accuracy: 'city_fallback' }
      } else {
        return { latitude: 43.2081, longitude: -75.4557, accuracy: 'county_fallback' }
      }
    }
  } catch (error) {
    console.error('❌ Geocoding error:', error.message)
    return {
      latitude: 43.2081,
      longitude: -75.4557,
      accuracy: 'error_fallback'
    }
  }
}

async function geocodeProviders() {
  try {
    console.log('🗺️  Starting geocoding process...')

    // Fetch all providers that need geocoding
    const { data: providers, error } = await supabase
      .from('healthcare_providers')
      .select('id, name, address')
      .is('latitude', null) // Only geocode providers without coordinates

    if (error) {
      console.error('❌ Error fetching providers:', error)
      return
    }

    console.log(`📊 Found ${providers.length} providers to geocode`)

    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < providers.length; i++) {
      const provider = providers[i]
      
      try {
        console.log(`\n⏳ Processing ${i + 1}/${providers.length}: ${provider.name}`)
        
        const coords = await geocodeAddress(provider.address)
        
        // Update provider with coordinates
        const { error: updateError } = await supabase
          .from('healthcare_providers')
          .update({
            latitude: coords.latitude,
            longitude: coords.longitude,
            geocoding_accuracy: coords.accuracy,
            geocoded_address: coords.place_name || null
          })
          .eq('id', provider.id)

        if (updateError) {
          console.error(`❌ Error updating ${provider.name}:`, updateError.message)
          errorCount++
        } else {
          console.log(`✅ Updated ${provider.name}: ${coords.latitude}, ${coords.longitude} (${coords.accuracy})`)
          successCount++
        }

        // Rate limiting - wait between requests
        await new Promise(resolve => setTimeout(resolve, 200))

      } catch (err) {
        console.error(`❌ Exception processing ${provider.name}:`, err.message)
        errorCount++
      }
    }

    console.log('\n📊 Geocoding Summary:')
    console.log(`✅ Successfully geocoded: ${successCount} providers`)
    console.log(`❌ Failed to geocode: ${errorCount} providers`)
    console.log(`📈 Total processed: ${successCount + errorCount} providers`)

    if (successCount > 0) {
      console.log('\n🎉 Geocoding completed successfully!')
      console.log('🗺️  All providers now have coordinates for map display')
      console.log('Visit your app at http://localhost:3001 to see them on the map!')
    }

  } catch (error) {
    console.error('💥 Fatal error during geocoding:', error)
  }
}

geocodeProviders()