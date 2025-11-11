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

async function addGeolocationColumns() {
  console.log('🗃️  Adding geolocation columns to healthcare_providers table...')

  try {
    // Check if columns already exist by trying to select them
    const { data, error } = await supabase
      .from('healthcare_providers')
      .select('latitude')
      .limit(1)

    if (!error) {
      console.log('✅ Geolocation columns already exist!')
      return
    }

    console.log('⚠️ Geolocation columns do not exist yet')
    console.log('')
    console.log('📋 Please run the following SQL in your Supabase dashboard SQL Editor:')
    console.log('')
    console.log('ALTER TABLE healthcare_providers ADD COLUMN latitude DECIMAL(10,8);')
    console.log('ALTER TABLE healthcare_providers ADD COLUMN longitude DECIMAL(11,8);')
    console.log('ALTER TABLE healthcare_providers ADD COLUMN geocoding_accuracy TEXT;')
    console.log('ALTER TABLE healthcare_providers ADD COLUMN geocoded_address TEXT;')
    console.log('')
    console.log('After running these commands, you can run: npm run geocode-providers')

  } catch (err) {
    console.error('❌ Error checking table structure:', err.message)
    console.log('')
    console.log('📋 Please run the following SQL in your Supabase dashboard SQL Editor:')
    console.log('')
    console.log('ALTER TABLE healthcare_providers ADD COLUMN latitude DECIMAL(10,8);')
    console.log('ALTER TABLE healthcare_providers ADD COLUMN longitude DECIMAL(11,8);')
    console.log('ALTER TABLE healthcare_providers ADD COLUMN geocoding_accuracy TEXT;')
    console.log('ALTER TABLE healthcare_providers ADD COLUMN geocoded_address TEXT;')
  }
}

addGeolocationColumns()