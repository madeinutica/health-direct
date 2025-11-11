# 🚀 Vercel Deployment Guide

This guide will help you deploy your Healthcare Directory app to Vercel with all necessary environment variables and configurations.

## Prerequisites

- [Vercel Account](https://vercel.com/signup)
- [Vercel CLI](https://vercel.com/cli) installed (`npm i -g vercel`)
- Supabase project with database setup
- Mapbox account with access token
- Open Router API account

## 📋 Environment Variables Required

### Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Mapbox Configuration
```
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoiZWZsb3JlenNhc2giLCJhIjoiY21odXVxMTRoMDQxZDJtb3Jjb25jdzEzaiJ9.cJLSXn8b8sdOBT9wArIu-w
```

### Open Router API Configuration
```
OPENROUTER_API_KEY=your-openrouter-api-key
```

## 🚀 Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Healthcare Directory App"
   git branch -M main
   git remote add origin https://github.com/yourusername/healthdirect.git
   git push -u origin main
   ```

2. **Connect to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js configuration

3. **Configure Environment Variables**:
   - In project settings, go to "Environment Variables"
   - Add all the variables listed above
   - Make sure to mark public variables as such (NEXT_PUBLIC_*)

4. **Deploy**:
   - Click "Deploy"
   - Vercel will build and deploy automatically

### Option 2: Deploy via Vercel CLI

1. **Login to Vercel**:
   ```bash
   vercel login
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

3. **Set Environment Variables**:
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   vercel env add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
   vercel env add OPENROUTER_API_KEY
   ```

## 🗄️ Database Setup

Before deployment, ensure your Supabase database is properly configured:

### 1. Run Database Migrations
Execute the SQL schema in your Supabase dashboard:
```sql
-- Copy and run the contents of supabase/migrations/001_initial_schema.sql
```

### 2. Import Healthcare Provider Data
Run the import script to populate your database:
```bash
npm run import-providers
```

### 3. Enable Row Level Security
Ensure RLS policies are properly configured (included in schema).

## 🧪 Testing Deployment

After deployment, test these key features:

1. **Homepage** - Should load without errors
2. **Directory Search** - Provider search and filtering
3. **Map View** - Interactive map with provider markers
4. **AI Chat** - Concierge functionality
5. **Community** - User discussions and posts
6. **Provider Details** - Individual provider pages

## 🔧 Production Optimizations

The app includes several production optimizations:

- **Next.js 15** with App Router for optimal performance
- **Edge API Routes** for fast response times
- **Static Generation** for public pages
- **Image Optimization** with Next.js Image component
- **Bundle Analysis** for size optimization
- **TypeScript** for type safety

## 🛠️ Troubleshooting

### Common Issues:

1. **Environment Variables Not Loading**:
   - Ensure variables are set in Vercel dashboard
   - Check variable names match exactly
   - Redeploy after adding variables

2. **Supabase Connection Issues**:
   - Verify URL and keys are correct
   - Check Supabase project is active
   - Ensure RLS policies allow public access where needed

3. **Mapbox Map Not Loading**:
   - Verify Mapbox token is valid
   - Check token has proper permissions
   - Ensure NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN is set

4. **AI Chat Not Working**:
   - Verify Open Router API key
   - Check API key has Claude 3 Haiku access
   - Monitor API rate limits

### Build Errors:

If build fails, check:
- All dependencies are in package.json
- TypeScript types are correct
- Environment variables for build-time checks

## 📊 Monitoring

After deployment, monitor:

- **Vercel Analytics** for performance metrics
- **Supabase Logs** for database issues
- **API Usage** for Open Router and Mapbox limits
- **Error Tracking** for runtime issues

## 🔄 Continuous Deployment

The app is configured for automatic deployments:
- Push to main branch triggers production deployment
- Pull requests create preview deployments
- Environment variables are inherited

## 📞 Support

For deployment issues:
1. Check Vercel deployment logs
2. Review Supabase dashboard for errors
3. Monitor browser console for client-side errors
4. Check API endpoints individually

---

**🎉 Your Healthcare Directory app is now ready for production!**

Visit your deployed URL to see your app live. The deployment includes all features:
✅ Provider Directory with Search  
✅ Interactive Maps  
✅ AI Concierge Chat  
✅ Community Features  
✅ Reviews & Ratings  
✅ Real CNY Healthcare Data