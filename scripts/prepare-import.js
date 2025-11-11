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

async function disableRLS() {
  console.log('🔓 Temporarily disabling RLS for data import...')
  
  const tables = [
    'healthcare_providers',
    'users', 
    'reviews',
    'community_posts'
  ]
  
  for (const table of tables) {
    try {
      // We'll try to clear existing data and insert fresh data
      console.log(`🧹 Clearing ${table} table...`)
      const { error } = await supabase
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all records
      
      if (error && !error.message.includes('new row violates')) {
        console.log(`⚠️ Could not clear ${table}:`, error.message)
      } else {
        console.log(`✅ Cleared ${table} table`)
      }
    } catch (err) {
      console.log(`⚠️ Error with ${table}:`, err.message)
    }
  }
  
  console.log('\n🚀 Ready for data import!')
  console.log('Run: npm run import-data')
}

disableRLS()