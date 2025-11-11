import { useState, useEffect } from 'react';
import { Search as SearchIcon, SlidersHorizontal, X } from 'lucide-react';
import { useLocation, useSearch } from 'wouter';
import TabBar from '@/components/TabBar';
import ProviderCard from '@/components/ProviderCard';
import { Button } from '@/components/ui/button';
import { processProviders, filterProviders, getUniqueLocations, getUniqueCategories } from '@/lib/dataUtils';
import type { HealthcareData, ProcessedProvider } from '@/lib/types';

export default function SearchPage() {
  const searchParams = useSearch();
  const params = new URLSearchParams(searchParams);
  const initialQuery = params.get('q') || '';
  const initialCategory = params.get('category') || 'All';

  const [data, setData] = useState<ProcessedProvider[]>([]);
  const [filteredData, setFilteredData] = useState<ProcessedProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [locations, setLocations] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  // Load data
  useEffect(() => {
    setLoading(true);
    fetch('/data.json')
      .then(res => res.json())
      .then((jsonData: HealthcareData) => {
        const processed = processProviders(jsonData.containsPlace);
        setData(processed);
        setFilteredData(processed);
        setLocations(getUniqueLocations(processed));
        setCategories(getUniqueCategories(processed));
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading data:', err);
        setLoading(false);
      });
  }, []);

  // Filter data when search/filters change
  useEffect(() => {
    const filtered = filterProviders(data, searchQuery, selectedCategory, selectedLocation);
    setFilteredData(filtered);
  }, [data, searchQuery, selectedCategory, selectedLocation]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedLocation('All');
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'All' || selectedLocation !== 'All';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-subhead text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-tab-safe">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-large-title text-foreground">
              Search
            </h1>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <SlidersHorizontal className="w-6 h-6 text-foreground" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search providers, specialties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-bar pl-12"
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 space-y-3 animate-in slide-in-from-top-2">
              <div>
                <label className="text-caption font-semibold text-foreground block mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="search-bar"
                >
                  <option value="All">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-caption font-semibold text-foreground block mb-2">
                  Location
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="search-bar"
                >
                  <option value="All">All Locations</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {hasActiveFilters && (
                <Button
                  onClick={handleClearFilters}
                  variant="outline"
                  className="w-full"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="container py-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-subhead text-muted-foreground">
            {filteredData.length} {filteredData.length === 1 ? 'provider' : 'providers'} found
          </p>
        </div>

        {filteredData.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-title-2 text-foreground mb-2">
              No providers found
            </h3>
            <p className="text-subhead text-muted-foreground mb-6">
              Try adjusting your search or filters
            </p>
            {hasActiveFilters && (
              <Button onClick={handleClearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredData.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        )}
      </div>

      {/* Tab Bar */}
      <TabBar />
    </div>
  );
}
