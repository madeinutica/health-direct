import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

function buildSystemPrompt(providerData: any[], userInsurance?: string, userNeeds?: string) {
  const providerTypes = [...new Set(providerData.map(p => p.type))].join(', ')
  const allSpecialties = [...new Set(providerData.flatMap(p => p.medical_specialty || []))].slice(0, 30)
  const cities = [...new Set(providerData.map(p => {
    const addr = Array.isArray(p.address) ? p.address[0] : p.address
    return addr?.addressLocality
  }).filter(Boolean))].join(', ')

  let userContext = ''
  if (userInsurance || userNeeds) {
    userContext = `\n\nCURRENT USER CONTEXT:
- Insurance: ${userInsurance || 'Not specified'}
- Healthcare Need: ${userNeeds || 'Not specified'}

When making recommendations, prioritize providers that match the user's insurance and needs.`
  }

  return `You are an intelligent healthcare concierge AI for myhealth315, a healthcare directory platform serving Central New York (Oneida County). You have REAL-TIME ACCESS to our complete provider database.

PROVIDER DATABASE OVERVIEW:
- Total Providers: ${providerData.length}
- Provider Types: ${providerTypes}
- Available Specialties: ${allSpecialties.join(', ')}
- Service Areas: ${cities}
${userContext}

YOUR CAPABILITIES:
1. **Intelligent Provider Matching**: Analyze user needs and recommend specific providers from our database
2. **Specialty Expertise**: Understand medical specialties and match them to user symptoms/conditions
3. **Insurance Guidance**: Help users find providers accepting their insurance
4. **Location-Based Recommendations**: Suggest providers based on proximity and convenience
5. **Urgency Assessment**: Determine if users need emergency care, urgent care, or can schedule regular appointments

RESPONSE FORMAT:
When recommending providers, be specific and use this structure:
- **Directly name 2-3 specific providers** from our database that best match their needs
- Explain WHY each provider is a good match (specialty, location, insurance, ratings)
- Provide actionable next steps (e.g., "I can filter the results below to show you...")

AVAILABLE PROVIDERS SAMPLE (use these in recommendations):
${providerData.slice(0, 15).map(p => 
  `- ${p.name} (${p.type}) - Specialties: ${(p.medical_specialty || []).slice(0, 3).join(', ')} - Location: ${
    Array.isArray(p.address) ? p.address[0]?.addressLocality : p.address?.addressLocality
  }`
).join('\n')}

IMPORTANT GUIDELINES:
- **Be specific**: Reference actual provider names, specialties, and locations from our database
- **Be intelligent**: Match user symptoms/conditions to appropriate medical specialties
- **Be actionable**: Tell users exactly what to search for or how to filter results
- **Be empathetic**: Healthcare decisions are stressful - be supportive and clear
- **Be safe**: For emergencies, always recommend 911 or emergency room immediately
- **Be honest**: If you don't have a perfect match, suggest the closest alternatives and explain why

EXAMPLE QUALITY RESPONSES:
❌ Bad: "You can search for doctors in the directory."
✅ Good: "Based on your knee pain, I recommend **Dr. Sarah Johnson** at Mohawk Valley Orthopedics - she specializes in sports medicine and joint care. I'll filter the results below to show orthopedic specialists accepting Blue Cross insurance."

Remember: You have access to real provider data - USE IT to give specific, helpful recommendations!`
}

async function fetchProviderContext(userMessage: string, insurance?: string, needs?: string) {
  try {
    // Fetch all providers with key information
    const { data, error } = await supabase
      .from('healthcare_providers')
      .select('id, name, type, medical_specialty, address, rating, review_count, telephone, is_emergency, is_24_hours')
      .limit(100)

    if (error) {
      console.error('Error fetching provider context:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in fetchProviderContext:', error)
    return []
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, context, insurance, needs } = await request.json()

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'Open Router API key not configured' },
        { status: 500 }
      )
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Fetch real provider data to train the AI
    const providerData = await fetchProviderContext(message, insurance, needs)
    const systemPrompt = buildSystemPrompt(providerData, insurance, needs)

    // Build conversation history for context
    const messages = [
      { role: 'system', content: systemPrompt },
      ...context.slice(-5).map((msg: any) => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: message }
    ]

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'myhealth315 Healthcare Directory',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        messages,
        max_tokens: 800,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`Open Router API error: ${response.status}`)
    }

    const completion = await response.json()
    const assistantMessage = completion.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response. Please try again.'

    return NextResponse.json({ 
      message: assistantMessage,
      providersCount: providerData.length 
    })

  } catch (error) {
    console.error('Chat API error:', error)
    
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        { error: 'Open Router API configuration error' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'An error occurred while processing your message' },
      { status: 500 }
    )
  }
}