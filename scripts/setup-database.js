const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

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

async function setupDatabase() {
  try {
    console.log('🗃️  Setting up database schema...')
    console.log('📋 Please run the migration SQL manually in your Supabase dashboard:')
    console.log('')
    console.log('1. Go to your Supabase dashboard (https://app.supabase.com)')
    console.log('2. Select your project')
    console.log('3. Go to "SQL Editor"')
    console.log('4. Copy and paste the content from: supabase/migrations/001_initial_schema.sql')
    console.log('5. Click "Run" to execute the migration')
    console.log('')
    console.log('Once the tables are created, you can run: npm run import-data')
    console.log('')
    console.log('⚡ Alternatively, check if the tables already exist...')
    
    // Try to check if tables exist
    const { data: tables, error } = await supabase
      .from('healthcare_providers')
      .select('id')
      .limit(1)

    if (!error) {
      console.log('✅ Tables already exist! You can run: npm run import-data')
    } else if (error.message.includes('does not exist') || error.message.includes('table')) {
      console.log('❌ Tables do not exist yet. Please run the migration SQL in Supabase dashboard.')
    } else {
      console.log('⚠️ Unexpected error:', error.message)
    }
    
  } catch (error) {
    console.error('💥 Error checking database:', error.message)
    console.log('')
    console.log('📋 Please run the migration SQL manually in your Supabase dashboard.')
  }
}

setupDatabase()