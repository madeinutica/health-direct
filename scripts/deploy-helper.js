#!/usr/bin/env node

/**
 * Vercel Deployment Helper Script
 * Helps setup and deploy the Healthcare Directory app to Vercel
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏥 Healthcare Directory - Vercel Deployment Helper\n');

// Check if required files exist
const requiredFiles = [
  '.env.local',
  'supabase/migrations/001_initial_schema.sql',
  'vercel.json'
];

console.log('📋 Checking deployment prerequisites...\n');

let allFilesExist = true;
for (const file of requiredFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
    allFilesExist = false;
  }
}

if (!allFilesExist) {
  console.log('\n❌ Please ensure all required files exist before deployment.');
  process.exit(1);
}

// Check environment variables
console.log('\n🔧 Checking environment variables...\n');

const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN',
    'OPENROUTER_API_KEY'
  ];

  for (const envVar of requiredEnvVars) {
    if (envContent.includes(envVar)) {
      console.log(`✅ ${envVar} configured`);
    } else {
      console.log(`❌ ${envVar} missing`);
    }
  }
}

console.log('\n🔨 Building project for production...\n');

try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('\n✅ Build successful!\n');
} catch (error) {
  console.log('\n❌ Build failed. Please fix errors before deployment.\n');
  process.exit(1);
}

console.log('🚀 Ready for deployment!\n');
console.log('Next steps:');
console.log('1. Push your code to GitHub');
console.log('2. Connect repository to Vercel');
console.log('3. Add environment variables in Vercel dashboard');
console.log('4. Deploy!');
console.log('\nOr use Vercel CLI:');
console.log('vercel --prod\n');

console.log('📖 For detailed instructions, see DEPLOYMENT.md');
console.log('🎉 Your Healthcare Directory app will be live soon!');