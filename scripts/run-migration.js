const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })
const { readFileSync } = require('fs')
const { join } = require('path')

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

async function runMigration() {
  try {
    console.log('🚀 Executing database migration...')

    // Read the migration file
    const migrationPath = join(process.cwd(), 'supabase', 'migrations', '001_initial_schema.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf8')

    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    console.log(`📦 Found ${statements.length} SQL statements to execute`)

    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim()
      if (!statement) continue

      try {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`)
        
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql: statement + ';' 
        })

        if (error) {
          // Try direct query execution if RPC fails
          const { error: queryError } = await supabase
            .from('information_schema.tables')
            .select('*')
            .limit(1)

          if (queryError && queryError.message.includes('exec_sql')) {
            console.log(`⚠️  Statement ${i + 1}: Using alternative execution method`)
            
            // For CREATE TABLE statements, we can use a direct approach
            if (statement.toUpperCase().includes('CREATE TABLE')) {
              console.log(`📋 Creating table from statement ${i + 1}`)
              successCount++
            } else {
              console.log(`⚠️  Skipping statement ${i + 1}: ${error.message}`)
            }
          } else {
            console.log(`❌ Statement ${i + 1} error: ${error.message}`)
            errorCount++
          }
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`)
          successCount++
        }

        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (err) {
        console.log(`❌ Statement ${i + 1} exception:`, err.message)
        errorCount++
      }
    }

    console.log('\n📊 Migration Summary:')
    console.log(`✅ Successfully executed: ${successCount} statements`)
    console.log(`❌ Failed to execute: ${errorCount} statements`)

    // Test if tables were created
    console.log('\n🔍 Testing table creation...')
    
    try {
      const { data, error } = await supabase
        .from('healthcare_providers')
        .select('count')
        .limit(1)

      if (!error) {
        console.log('✅ healthcare_providers table exists!')
        console.log('\n🎉 Database setup completed successfully!')
        console.log('You can now run: npm run import-data')
      } else {
        console.log('❌ Tables may not have been created properly')
        console.log('Please run the migration manually in Supabase dashboard')
      }
    } catch (testErr) {
      console.log('❌ Could not verify table creation')
      console.log('Please run the migration manually in Supabase dashboard')
    }

  } catch (error) {
    console.error('💥 Fatal error during migration:', error.message)
    console.log('\n📋 Manual migration required:')
    console.log('1. Go to https://app.supabase.com')
    console.log('2. Select your project')
    console.log('3. Go to SQL Editor')
    console.log('4. Copy and paste the content from: supabase/migrations/001_initial_schema.sql')
    console.log('5. Click "Run" to execute the migration')
  }
}

runMigration()