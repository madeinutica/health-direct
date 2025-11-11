# HealthDirect - Healthcare Provider Directory

A modern, minimal healthcare directory application for Oneida County, NY, built with Next.js, TypeScript, Tailwind CSS, and Supabase. Features real CNY healthcare provider data with 103+ providers.

## ✨ Features

- **🔍 Smart Directory**: Intelligent search and filtering for healthcare providers
- **⭐ Community Reviews**: Patient reviews and ratings system  
- **👥 Social Community**: Discussion forums and community interactions
- **🤖 AI Concierge**: Chat-based healthcare guidance using Claude 3 Haiku
- **🗺️ Interactive Maps**: Mapbox integration with provider locations
- **📱 Modern UI**: Clean, Uber-like minimal design
- **📲 Mobile Responsive**: Optimized for all devices
- **🏥 Real Data**: 103 actual CNY healthcare providers imported

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL) 
- **Authentication**: Supabase Auth
- **Maps**: Mapbox GL JS
- **AI**: Open Router API (Claude 3 Haiku)
- **Icons**: Heroicons
- **Deployment**: Vercel

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── directory/         # Provider directory pages
│   ├── community/         # Community features  
│   ├── reviews/           # Review system
│   ├── provider/          # Individual provider pages
│   └── api/chat/         # AI concierge API
├── components/           # Reusable UI components
│   ├── DirectorySearch.tsx
│   ├── Map.tsx
│   ├── AIChat.tsx
│   └── Navigation.tsx
├── lib/                 # Utility functions
├── types/               # TypeScript definitions
└── styles/              # Global styles

supabase/
├── migrations/          # Database schema
└── 001_initial_schema.sql

scripts/
├── import-cny-data.js   # CNY provider import
├── geocode-providers.js # Geocoding script
└── setup-geolocation.js
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account  
- Mapbox account with access token
- Open Router API account (for AI chat)

### Installation

1. **Clone and setup**
   ```bash
   git clone <repository-url>
   cd healthdirect
   npm install
   ```

2. **Environment variables**
   Create `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token
   OPENROUTER_API_KEY=your_openrouter_key
   ```

3. **Database setup**
   - Run `supabase/migrations/001_initial_schema.sql` in Supabase dashboard
   - Import CNY data: `npm run import-providers`

4. **Start development**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

## 🚀 Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

**Quick Vercel Deployment:**
```bash
npm i -g vercel
vercel login
vercel --prod
```

Set environment variables in Vercel dashboard and deploy!

## Database Schema

The application uses a PostgreSQL database with the following main tables:

- `healthcare_providers` - Provider information and services
- `users` - User profiles and authentication
- `reviews` - Patient reviews and ratings
- `community_posts` - Community discussion posts
- `post_replies` - Replies to community posts
- `chat_sessions` - AI concierge chat sessions
- `chat_messages` - Chat conversation history

## Features Overview

### Healthcare Directory
- Search providers by name, specialty, or condition
- Filter by provider type, location, and services
- View detailed provider profiles
- Emergency and 24/7 service indicators

### Review System
- 5-star rating system
- Written reviews with verification
- Aggregate ratings and review counts
- Anonymous review options

### Community Features
- Discussion forums by category
- User profiles and verification
- Post likes and reply threading
- Community moderation

### AI Concierge
- Chat-based healthcare guidance
- Provider recommendations
- Symptom and condition information
- 24/7 availability

## Deployment

### Vercel Deployment

1. **Connect to Vercel**
   ```bash
   npm i -g vercel
   vercel login
   vercel
   ```

2. **Set environment variables in Vercel dashboard**
   - Add all environment variables from `.env.local`

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Environment Variables for Production

**Required for Vercel deployment:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` 
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`
- `OPENROUTER_API_KEY`

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run import-providers` - Import CNY healthcare data
- `npm run geocode-providers` - Add coordinates to providers

### 🎯 Key Features Implemented

✅ **Next.js 15** with App Router  
✅ **TypeScript** for type safety  
✅ **Supabase** integration with RLS  
✅ **Mapbox GL** interactive maps  
✅ **Open Router AI** chat system  
✅ **Real CNY Data** (103 providers)  
✅ **Responsive Design** mobile-first  
✅ **Production Ready** optimized build

## 🏥 Healthcare Data

The application includes **103 real healthcare providers** from Oneida County, NY:

### Provider Types:
- **🏥 Hospitals** - Wynn Hospital, Rome Health, Oneida Health
- **⚡ Urgent Care** - WellNow, Your Quick Care, Bassett Express Care
- **👨‍⚕️ Medical Centers** - Surgery centers, specialty clinics
- **🩺 Physicians** - Primary care, specialists across all fields
- **🧪 Laboratories** - Quest Diagnostics, LabCorp locations
- **🧠 Mental Health** - Counseling, addiction services

### Specialties Covered:
Cardiology, Orthopedics, Neurology, Oncology, Pediatrics, Dermatology, Mental Health, Emergency Medicine, Family Medicine, Internal Medicine, and more.

### Data Features:
- **📍 Accurate Addresses** - Real street addresses for all providers
- **📞 Contact Information** - Phone numbers and websites
- **⏰ Service Hours** - 24/7 and emergency indicators  
- **🏷️ Specialties** - Detailed medical specialty listings
- **⭐ Rating System** - Patient review capabilities

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@healthdirect.example.com or create an issue in this repository.