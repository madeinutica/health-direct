// Test Supabase connection and data
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

console.log('🧪 Testing Supabase connection...')
console.log('📍 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('🔑 Anon Key present:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

async function testConnection() {
  try {
    console.log('\n🔍 Testing basic select query...')
    const { data, error, count } = await supabase
      .from('healthcare_providers')
      .select('*', { count: 'exact' })
      .limit(5)

    if (error) {
      console.error('❌ Query Error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
    } else {
      console.log('✅ Query successful!')
      console.log('📊 Total providers:', count)
      console.log('📋 Sample data:', data?.slice(0, 2).map(p => ({ 
        id: p.id, 
        name: p.name, 
        type: p.type 
      })))
    }

    // Test specific columns
    console.log('\n🔍 Testing column names...')
    const { data: columnTest, error: columnError } = await supabase
      .from('healthcare_providers')
      .select('name, type, medical_specialty')
      .limit(1)

    if (columnError) {
      console.error('❌ Column test error:', columnError)
    } else {
      console.log('✅ Column test successful:', columnTest?.[0])
    }

  } catch (error) {
    console.error('💥 Connection test failed:', error)
  }
}

testConnection()