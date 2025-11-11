// ... existing imports ...

export default function DirectorySearch({ onSearchResults, initialProviders = [] }: DirectorySearchProps) {
  // ... existing state and hooks ...

  // Memoize supabase client to prevent recreation on every render
  const supabase = useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Supabase environment variables not configured')
      return null
    }
    
    return createClient(supabaseUrl, supabaseKey)
  }, [])

  const fetchProviders = useCallback(async () => {
    if (!supabase) {
      console.error('❌ Supabase client not initialized')
      return
    }
    
    setLoading(true)
    try {
      // ... existing fetch logic ...
    } catch (error) {
      console.error('💥 Fetch error:', error)
      // Use mock data as fallback
      const mockResults: HealthcareProvider[] = []
      setProviders(mockResults)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, selectedCategory, selectedSpecialty, supabase])

  // ... rest of the component ...
}