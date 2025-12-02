# Quick Start Guide - Oneida County Healthcare Directory

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm (or yarn/pnpm)
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Text editor (VS Code recommended)

### Project Setup

This project appears to be part of a larger workspace. Based on the file structure, it's likely using **Vite + React**.

#### Option 1: If package.json exists at parent level
```bash
cd c:\Users\reill\dyad-apps\Healthcare315
npm install
npm run dev
```

#### Option 2: If setting up fresh
```bash
# Create new Vite + React + TypeScript project
npm create vite@latest healthcare315 -- --template react-ts

# Copy all src files, components, and data
# Install dependencies
npm install wouter lucide-react chart.js
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install shadcn/ui components
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input checkbox label
```

---

## 📁 Understanding the File Structure

### Root Files
```
Healthcare315/
├── index.html              # Entry HTML file
├── index.css               # Global styles & Tailwind
├── App.tsx                 # Main app with routing
├── cnyhealth.json          # Provider database (80+ providers)
└── todo.md                 # Project tracking
```

### Core Components (Root Level)
```
├── TabBar.tsx              # Bottom navigation (5 tabs)
├── ProviderCard.tsx        # Provider list item with badges
├── ProviderDetail.tsx      # Full provider page
├── CategoryGrid.tsx        # Home page category icons
├── CrisisBanner.tsx        # Emergency help banner
├── SearchPage.tsx          # Main search interface
├── MapPage.tsx             # Map view
├── AssistantPage.tsx       # AI chat interface
├── NewHome.tsx             # Dashboard/home page
└── types.ts                # TypeScript type definitions
```

### Organized Folders
```
src/
├── components/             # Reusable UI components
├── contexts/
│   └── UserProfileContext.tsx  # Global insurance profile state
├── lib/
│   ├── dataUtils.ts        # Filtering & processing logic
│   └── types.ts            # Type definitions
└── pages/
    └── ProfilePage.tsx     # Insurance management page
```

---

## 🎯 Key Features to Understand

### 1. User Profile System
**File**: `src/contexts/UserProfileContext.tsx`

```typescript
// Global state for user's insurance
interface UserProfile {
  selectedInsurancePlans: string[];  // ["Fidelis Care", "Excellus"]
  acceptsMedicaid: boolean;
  acceptsMedicare: boolean;
}

// Persists to localStorage automatically
// Access anywhere: const { profile, updateProfile } = useUserProfile();
```

### 2. Provider Filtering
**File**: `src/lib/dataUtils.ts`

```typescript
// Main filtering function
filterProviders(
  providers: ProcessedProvider[],
  searchTerm: string,              // Text search
  category: string,                // "Cardiology & Heart Care"
  location: string,                // "Utica"
  userInsurance: string[],         // User's plans
  userMedicaid: boolean,
  userMedicare: boolean,
  filterInNetwork: boolean         // Show only in-network?
): ProcessedProvider[]

// Smart categorization
categorizeProvider(type: string, specialties: string[]): string
// Returns: "Maternity & Women's Health", "ENT & Allergy", etc.
```

### 3. Provider Data Model
**File**: `types.ts`

```typescript
interface ProcessedProvider {
  id: string;
  name: string;
  category: string;                // Auto-categorized
  location: string;                // City name
  address: string;                 // Full address
  phone: string;
  specialties: string[];
  services: string[];
  organization?: string;           // "Mohawk Valley Health System"
  acceptsInsurance?: string[];     // ["Fidelis", "Medicaid", ...]
  network?: string;
  acceptsMedicaid?: boolean;
  acceptsMedicare?: boolean;
}
```

---

## 🔧 Common Tasks

### Adding a New Provider
1. Open `cnyhealth.json`
2. Add to `containsPlace` array:
```json
{
  "@type": "Physician",
  "name": "Dr. Smith Family Practice",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Main St",
    "addressLocality": "Utica",
    "addressRegion": "NY",
    "postalCode": "13501"
  },
  "telephone": "315-555-1234",
  "medicalSpecialty": ["Primary Care", "Family Medicine"],
  "acceptsInsurance": ["Fidelis Care", "Excellus", "Medicaid"],
  "acceptsMedicaid": true,
  "acceptsMedicare": true,
  "network": "Mohawk Valley Health System"
}
```

### Adding a New Category
1. Open `src/lib/dataUtils.ts`
2. Add to `categorizeProvider()` function:
```typescript
if (specialtyStr.includes('your specialty')) return 'Your Category Name';
```
3. Add matching icon to `CategoryGrid.tsx`:
```tsx
{ id: 'your-category', label: 'Your Category', icon: '🏥', category: 'Your Category Name' }
```

### Modifying Insurance Filtering
1. Open `src/lib/dataUtils.ts`
2. Edit `filterProviders()` function
3. Main logic is in the `if (filterInNetwork)` block

### Changing Color Scheme
1. Open `index.css`
2. Modify CSS variables in `:root` and `.dark`:
```css
:root {
  --primary: 221.2 83.2% 53.3%;  /* Main accent color */
  --background: 0 0% 100%;        /* Page background */
  --card: 0 0% 100%;             /* Card background */
}
```

### Adding a New Page
1. Create component in `src/pages/` (e.g., `AboutPage.tsx`)
2. Add route in `App.tsx`:
```tsx
<Route path="/about" component={AboutPage} />
```
3. Add tab in `TabBar.tsx` (if needed):
```tsx
{ id: 'about', label: 'About', icon: Info, path: '/about' }
```

---

## 🧪 Testing the Application

### Manual Testing Flow

#### Test 1: Profile Setup
```
1. Open app → Navigate to Profile tab
2. Search for "Fidelis"
3. Select "Fidelis Care"
4. Toggle "Medicaid" ON
5. Refresh page
   ✓ Should retain selections
```

#### Test 2: In-Network Filtering
```
1. Navigate to Search tab
2. Click filters button
3. Enable "Show In-Network Providers"
4. Verify count changes
5. Open a provider card
   ✓ Should show insurance badges
   ✓ Should show "Accepts your plan"
```

#### Test 3: AI Assistant
```
1. Navigate to Assistant tab
2. Type "I need a cardiologist"
3. Answer insurance question
4. Answer location question
5. Answer urgency question
   ✓ Should show 3-5 matched providers
   ✓ Should explain why each was matched
```

#### Test 4: Provider Details
```
1. Go to Search → Select any provider
2. Check sections appear:
   ✓ Contact Information
   ✓ Specialties
   ✓ Services
   ✓ Insurance Accepted
3. Click "Call" button
   ✓ Should open phone dialer
4. Click "Directions" button
   ✓ Should open maps
```

### Browser Console Checks
```javascript
// Check localStorage
localStorage.getItem('userProfile')
// Should show: {"selectedInsurancePlans":[...],"acceptsMedicaid":true,"acceptsMedicare":false}

// Check provider data
fetch('/cnyhealth.json').then(r => r.json()).then(console.log)
// Should show full JSON structure
```

---

## 🐛 Troubleshooting

### Issue: App won't start
**Solution**: 
```bash
# Check if parent directory has package.json
cd ..
npm install
npm run dev

# Or check for specific Vite/React setup
```

### Issue: Insurance filtering not working
**Check**:
1. User has selected plans in Profile
2. Providers have `acceptsInsurance` array in JSON
3. `filterInNetwork` state is true in SearchPage

### Issue: Provider cards missing data
**Check**:
1. `cnyhealth.json` is in public/ or root
2. `dataUtils.processProviders()` is working
3. Browser console for fetch errors

### Issue: Types errors in TypeScript
**Solution**:
```bash
# Ensure all types are imported
import type { ProcessedProvider, HealthcareData } from '@/lib/types';

# Check tsconfig.json has proper paths
```

---

## 📦 Deployment

### Build for Production

#### Vite Project
```bash
npm run build
# Output: dist/ folder
# Deploy dist/ to any static host
```

### Deployment Options

#### Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

#### Netlify
```bash
# Via Netlify CLI
npm install -g netlify-cli
netlify deploy --prod

# Or drag dist/ folder to netlify.com
```

#### GitHub Pages
```bash
# Add to package.json
"homepage": "https://yourusername.github.io/healthcare315"

# Build and deploy
npm run build
npx gh-pages -d dist
```

#### Replit
```
1. Fork the repl
2. Click "Run"
3. Share via repl.it URL
```

### Environment Variables
If needed, create `.env` file:
```env
VITE_APP_TITLE=Oneida County Healthcare
VITE_APP_LOGO=/logo.png
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
```

---

## 🔒 Data Privacy Notes

### What's Stored Locally
- User's selected insurance plans (localStorage)
- Medicaid/Medicare preferences (localStorage)
- No personal health information
- No login credentials

### HIPAA Considerations
This is a **directory application only**:
- ✅ No protected health information (PHI)
- ✅ No patient records
- ✅ No appointment data
- ✅ Public provider information only

If adding user accounts or health records, you would need:
- Backend with encryption
- HIPAA-compliant hosting
- Business Associate Agreements
- Security audit

---

## 📚 Additional Resources

### Code Documentation
- `PROJECT_SUMMARY.md` - Complete feature overview
- `PROJECT_EVOLUTION.md` - How we got here
- `todo.md` - Development tracking
- `AI_RULES.md` - Development guidelines

### External Docs
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Wouter Router](https://github.com/molefrog/wouter)
- [Lucide Icons](https://lucide.dev/icons)
- [Chart.js](https://www.chartjs.org/docs/)

### Getting Help
1. Check browser console for errors
2. Review TypeScript errors in editor
3. Test in incognito mode (fresh localStorage)
4. Verify JSON data is valid
5. Check component props match types

---

## 🎓 Learning Path

### For New Developers
1. **Week 1**: Understand React basics and component structure
2. **Week 2**: Learn TypeScript types and interfaces
3. **Week 3**: Study Context API and state management
4. **Week 4**: Master Tailwind CSS and responsive design

### For Experienced Developers
1. **Day 1**: Review `App.tsx` and `UserProfileContext.tsx`
2. **Day 2**: Study `dataUtils.ts` filtering logic
3. **Day 3**: Examine `AssistantPage.tsx` conversation flow
4. **Day 4**: Ready to add features!

---

## ✅ Quick Checklist

Before making changes:
- [ ] Read `AI_RULES.md` for tech stack guidelines
- [ ] Understand TypeScript types in `types.ts`
- [ ] Test existing features manually
- [ ] Set up development environment

Before committing code:
- [ ] TypeScript compiles without errors
- [ ] All imports resolve correctly
- [ ] Test on mobile viewport (375px)
- [ ] Check browser console for errors
- [ ] Verify localStorage persistence

Before deploying:
- [ ] Run production build (`npm run build`)
- [ ] Test built version (`npm run preview`)
- [ ] Check all routes work
- [ ] Verify data.json loads correctly
- [ ] Test on multiple devices

---

## 🆘 Emergency Fixes

### Reset User Profile
```javascript
// In browser console
localStorage.removeItem('userProfile');
location.reload();
```

### Fix Broken Filters
```javascript
// Check current filter state
console.log(JSON.parse(localStorage.getItem('userProfile')));

// Reset to defaults
localStorage.setItem('userProfile', JSON.stringify({
  selectedInsurancePlans: [],
  acceptsMedicaid: false,
  acceptsMedicare: false
}));
```

### Clear All App Data
```javascript
localStorage.clear();
location.reload();
```

---

## 🎉 You're Ready!

The Healthcare315 application is:
- ✅ Fully documented
- ✅ Well-structured
- ✅ Type-safe
- ✅ Production-ready

**Next Steps**:
1. Set up your development environment
2. Run the app locally
3. Test all features
4. Make your first enhancement!

*Good luck, and happy coding!* 🚀

---

*Last Updated: November 11, 2025*  
*For questions or issues, refer to PROJECT_SUMMARY.md*
