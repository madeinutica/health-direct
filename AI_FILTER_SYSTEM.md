# AI-Controlled Dynamic Filter System

## Overview
The AI Assistant now intelligently controls the directory search filters based on user conversations. When users ask questions, the AI can automatically apply relevant filters to show the best matching providers.

## How It Works

### 1. **AI Filter Response Format**
When the AI wants to apply filters, it includes a special JSON block in its response:

```
"Based on your knee pain and Blue Cross insurance, I recommend orthopedic specialists. Let me show you the best matches.
```filters
{
  "specialty": "Orthopedics",
  "insurance": "Blue Cross"
}
```"
```

### 2. **Filter Parsing**
The chat API (`/api/chat/route.ts`) automatically:
- Detects filter blocks in AI responses
- Parses the JSON
- Returns both the message and filters separately
- Removes the filter block from the displayed message

### 3. **Filter Application**
The directory page:
- Receives filter data from AI responses
- Passes filters to DirectorySearch component
- DirectorySearch applies filters and fetches matching providers
- Shows visual indicator that AI applied filters

## Available Filters

### Search Query
```json
{ "searchQuery": "knee pain specialist" }
```
Searches provider names and descriptions.

### Specialty
```json
{ "specialty": "Orthopedics" }
```
Options: Emergency, Primary Care, Cardiology, Orthopedics, Neurology, Oncology, Pediatrics, Dermatology, Mental Health

### Provider Type
```json
{ "providerType": "Hospital" }
```
Options: Hospital, MedicalClinic, Physician, MedicalCenter, MedicalLaboratory

### Insurance
```json
{ "insurance": "Blue Cross" }
```
Options: Blue Cross, Aetna, UnitedHealthcare, Cigna, Medicaid, Medicare, Humana

### Location
```json
{ "location": "Utica" }
```
Options: Utica, Rome, New Hartford, Oneida, Clinton

### Emergency Care
```json
{ "emergency": true }
```
Shows only 24/7 emergency providers.

### Minimum Rating
```json
{ "rating": 4.0 }
```
Options: 3, 4, 4.5

## Example Conversations

### Example 1: Insurance + Specialty
**User**: "I have Blue Cross and need help with knee pain"

**AI Response**:
```
Based on your knee pain and Blue Cross insurance, I recommend seeing an orthopedic specialist. Let me show you orthopedic providers that accept Blue Cross insurance in your area.
```filters
{
  "specialty": "Orthopedics",
  "insurance": "Blue Cross"
}
```
```

**Result**: Directory automatically shows only orthopedic specialists who accept Blue Cross.

### Example 2: Location + Emergency
**User**: "I need urgent care in Rome"

**AI Response**:
```
For urgent care in Rome, I recommend visiting Rome Memorial Hospital's Emergency Department, which is open 24/7. Here are emergency and urgent care facilities in Rome.
```filters
{
  "location": "Rome",
  "emergency": true
}
```
```

**Result**: Shows only emergency/urgent care in Rome.

### Example 3: Rating + Specialty
**User**: "Show me highly rated cardiologists"

**AI Response**:
```
Here are the top-rated cardiologists in Central New York. All have ratings of 4.5 stars or higher based on patient reviews.
```filters
{
  "specialty": "Cardiology",
  "rating": 4.5
}
```
```

**Result**: Shows only cardiologists with 4.5+ star ratings.

### Example 4: Multi-Criteria
**User**: "I need a pediatrician in Utica who takes Medicaid and has good reviews"

**AI Response**:
```
I've found excellent pediatricians in Utica who accept Medicaid insurance. All have ratings of 4+ stars. Dr. Sarah Johnson at Utica Pediatric Associates is highly recommended with a 4.8 rating.
```filters
{
  "specialty": "Pediatrics",
  "location": "Utica",
  "insurance": "Medicaid",
  "rating": 4
}
```
```

**Result**: Shows pediatricians in Utica accepting Medicaid with 4+ stars.

## Technical Implementation

### Chat API Enhancement
```typescript
// Parse filters from AI response
const filterMatch = assistantMessage.match(/```filters\s*([\s\S]*?)```/)
if (filterMatch && filterMatch[1]) {
  filters = JSON.parse(filterMatch[1].trim())
  cleanedMessage = assistantMessage.replace(/```filters\s*[\s\S]*?```/, '').trim()
}

return NextResponse.json({ 
  message: cleanedMessage,
  filters,
  providersCount: providerData.length 
})
```

### Directory Page
```typescript
const [aiFilters, setAiFilters] = useState<AIFilters | null>(null)

// Handle AI response
const data = await response.json()
if (data.filters) {
  setAiFilters(data.filters)
}

// Pass to DirectorySearch
<DirectorySearch 
  aiFilters={aiFilters}
  onFiltersCleared={() => setAiFilters(null)}
/>
```

### DirectorySearch Component
```typescript
// Apply AI filters
useEffect(() => {
  if (aiFilters) {
    if (aiFilters.searchQuery) setSearchQuery(aiFilters.searchQuery)
    if (aiFilters.providerType) setSelectedCategory(aiFilters.providerType)
    if (aiFilters.specialty) setSelectedSpecialty(aiFilters.specialty)
    if (aiFilters.insurance) setSelectedInsurance(aiFilters.insurance)
    if (aiFilters.location) setSelectedLocation(aiFilters.location)
    if (aiFilters.rating) setMinRating(aiFilters.rating)
    setShowFilters(true) // Auto-open filters
  }
}, [aiFilters])

// Enhanced Supabase query
if (selectedInsurance !== 'all') {
  query = query.contains('accepts_insurance', [selectedInsurance])
}
if (selectedLocation !== 'all') {
  query = query.ilike('address->0->addressLocality', `%${selectedLocation}%`)
}
if (minRating > 0) {
  query = query.gte('rating', minRating)
}
```

## User Experience

### Visual Feedback
When AI applies filters, users see:
1. **Blue notification banner**: "AI Assistant applied filters based on your conversation"
2. **Filters panel auto-opens**: Shows which filters are active
3. **Updated results**: Provider list immediately reflects filters
4. **Clear button**: Allows users to reset filters

### Ongoing Refinement
Users can continue the conversation:
- "Show me only 5-star providers"
- "Are there any closer to me?"
- "Which ones have same-day appointments?"

Each response can update filters incrementally or replace them entirely.

## Database Schema Requirements

### Provider Table Fields
Filters rely on these database columns:
- `medical_specialty`: Array of specialty strings
- `accepts_insurance`: Array of insurance provider names
- `address`: JSON with addressLocality field
- `type`: Provider type (Hospital, MedicalClinic, etc.)
- `rating`: Numeric rating value
- `is_emergency`: Boolean for 24/7 emergency care

### Example Provider Record
```json
{
  "name": "Mohawk Valley Orthopedics",
  "type": "MedicalClinic",
  "medical_specialty": ["Orthopedics", "Sports Medicine"],
  "accepts_insurance": ["Blue Cross", "Aetna", "UnitedHealthcare"],
  "address": { "addressLocality": "Utica" },
  "rating": 4.7,
  "is_emergency": false
}
```

## Benefits

### For Users
✅ Natural language search - just describe what you need
✅ No manual filter selection required
✅ Instant, accurate results
✅ Continuous refinement through conversation
✅ Transparent - can see which filters are applied

### For The Platform
✅ Higher search accuracy
✅ Better user engagement
✅ Reduced search friction
✅ More conversions to provider pages
✅ Data-driven filtering

## Future Enhancements

### 1. **Availability Filtering**
```json
{ "availability": "same-day" }
```
Show only providers with immediate availability.

### 2. **Distance-Based Filtering**
```json
{ "maxDistance": 5, "userLocation": "43.1009,-75.2327" }
```
Filter by proximity to user's location.

### 3. **Language Filtering**
```json
{ "language": "Spanish" }
```
Show providers who speak specific languages.

### 4. **Gender Preference**
```json
{ "providerGender": "female" }
```
Filter by provider gender preference.

### 5. **Accepting New Patients**
```json
{ "acceptingNewPatients": true }
```
Show only providers currently accepting new patients.

### 6. **Telehealth**
```json
{ "telehealth": true }
```
Filter for virtual visit capabilities.

## Testing Scenarios

### Test Case 1: Basic Specialty Filter
- User: "I need a cardiologist"
- Expected: AI sets `specialty: "Cardiology"`
- Verify: Only cardiologists shown

### Test Case 2: Insurance + Location
- User: "Medicare doctors in Rome"
- Expected: AI sets `insurance: "Medicare"`, `location: "Rome"`
- Verify: Only Medicare-accepting providers in Rome

### Test Case 3: Rating Filter
- User: "Show me the best providers"
- Expected: AI sets `rating: 4.5`
- Verify: Only 4.5+ star providers shown

### Test Case 4: Emergency Care
- User: "I need emergency care now"
- Expected: AI sets `emergency: true`
- Verify: Only 24/7 emergency facilities shown

### Test Case 5: Filter Refinement
- User: "I need a doctor" → AI shows all doctors
- User: "Actually, just pediatricians" → AI updates to `specialty: "Pediatrics"`
- Verify: Results update to pediatricians only

### Test Case 6: Clear Filters
- User: Applied filters active
- User: Clicks "Clear All Filters"
- Verify: All filters reset, all providers shown

## Monitoring & Analytics

### Track:
- Filter application rate: % of conversations that apply filters
- Filter accuracy: Do applied filters match user intent?
- Conversion rate: Do filtered results lead to provider views?
- Popular filter combinations: Which filters are used together?
- Refinement patterns: How many times do users refine filters?

### Success Metrics:
- Increased provider page views from filtered results
- Reduced "no results" searches
- Higher user satisfaction (based on session length, return visits)
- More specific search queries over time

## Conclusion

The AI-controlled filter system transforms search from manual selection to intelligent conversation. Users simply describe what they need, and the AI automatically applies the right filters to show the best matching providers. This creates a seamless, natural search experience while maintaining transparency and user control.
