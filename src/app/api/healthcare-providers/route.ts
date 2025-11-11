import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const specialty = searchParams.get('specialty')

    let query = supabase
      .from('healthcare_providers')
      .select('*')
      .order('name')

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    if (category && category !== 'all') {
      query = query.eq('type', category)
    }

    if (specialty && specialty !== 'all') {
      query = query.contains('medical_specialty', [specialty])
    }

    const { data, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch providers' },
        { status: 500 }
      )
    }

    // Format the data for the frontend
    const formattedData = data?.map(provider => ({
      ...provider,
      address: typeof provider.address === 'string' ? JSON.parse(provider.address) : provider.address,
      telephone: Array.isArray(provider.telephone) ? provider.telephone : [provider.telephone].filter(Boolean),
      medicalSpecialty: Array.isArray(provider.medical_specialty) ? provider.medical_specialty : [],
      serviceType: Array.isArray(provider.service_type) ? provider.service_type : []
    })) || []

    return NextResponse.json(formattedData)

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}