import { NextRequest, NextResponse } from 'next/server'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

const SYSTEM_PROMPT = `You are a helpful healthcare concierge assistant for a healthcare directory platform in Oneida County, New York. Your role is to help users find appropriate healthcare providers, understand healthcare services, and provide general guidance about healthcare options in the area.

Key areas you can help with:
- Finding healthcare providers by specialty, location, or specific needs
- Explaining different types of healthcare services
- Helping users understand when to seek emergency care vs. urgent care vs. regular appointments
- Providing information about common medical specialties
- Offering guidance on healthcare insurance and coverage questions
- Suggesting questions to ask healthcare providers

Important guidelines:
- Always recommend users consult with qualified healthcare professionals for medical advice
- Never provide specific medical diagnoses or treatment recommendations
- Focus on helping users navigate the healthcare system and find appropriate care
- Be empathetic and understanding, as healthcare decisions can be stressful
- If asked about specific providers, suggest using the directory search features
- Keep responses helpful, clear, and concise
- For emergency situations, always recommend calling 911 or going to the nearest emergency room

The healthcare directory includes hospitals, medical clinics, physicians, medical centers, laboratories, and other healthcare providers in the Oneida County area, including cities like Utica, Rome, Oneida, New Hartford, and surrounding communities.`

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json()

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

    // Build conversation history for context
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
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
        'X-Title': 'Healthcare Directory',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`Open Router API error: ${response.status}`)
    }

    const completion = await response.json()
    const assistantMessage = completion.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response. Please try again.'

    return NextResponse.json({ message: assistantMessage })

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