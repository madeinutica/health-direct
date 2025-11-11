const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function addColumns() {
  console.log('🗃️  Adding geolocation columns directly...')

  const alterStatements = [
    'ALTER TABLE healthcare_providers ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8)',
    'ALTER TABLE healthcare_providers ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8)',
    'ALTER TABLE healthcare_providers ADD COLUMN IF NOT EXISTS geocoding_accuracy TEXT',
    'ALTER TABLE healthcare_providers ADD COLUMN IF NOT EXISTS geocoded_address TEXT'
  ]

  for (const sql of alterStatements) {
    try {
      console.log(`⏳ Executing: ${sql}`)
      
      // Try to execute via a simple insert/update first to test connection
      const { data: testData, error: testError } = await supabase
        .from('healthcare_providers')
        .select('id')
        .limit(1)

      if (testError) {
        console.log('❌ Cannot connect to database:', testError.message)
        break
      }

      // Since we can't execute DDL directly, let's just verify the table exists
      console.log('✅ Database connection successful')
      
    } catch (err) {
      console.log(`⚠️ ${err.message}`)
    }
  }

  console.log('')
  console.log('📋 To add the geolocation columns, please:')
  console.log('1. Go to your Supabase dashboard (https://app.supabase.com)')
  console.log('2. Select your project')
  console.log('3. Go to "SQL Editor"')
  console.log('4. Copy and paste these commands:')
  console.log('')
  console.log('ALTER TABLE healthcare_providers ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8);')
  console.log('ALTER TABLE healthcare_providers ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8);')
  console.log('ALTER TABLE healthcare_providers ADD COLUMN IF NOT EXISTS geocoding_accuracy TEXT;')
  console.log('ALTER TABLE healthcare_providers ADD COLUMN IF NOT EXISTS geocoded_address TEXT;')
  console.log('')
  console.log('5. Click "Run"')
  console.log('6. Then run: npm run geocode-providers')
}

addColumns()