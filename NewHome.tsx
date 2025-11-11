import { useState, useEffect } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { useLocation } from 'wouter';
import TabBar from '@/components/TabBar';
import CrisisBanner from '@/components/CrisisBanner';
import CategoryGrid from '@/components/CategoryGrid';
import ProviderCard from '@/components/ProviderCard';
import { processProviders } from '@/lib/dataUtils';
import type { HealthcareData, ProcessedProvider } from '@/lib/types';

export default function NewHome() {
  const [, setLocation] = useLocation();
  const [data, setData] = useState<ProcessedProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Load data
  useEffect(() => {
    setLoading(true);
    fetch('/data.json')
      .then(res => res.json())
      .then((jsonData: HealthcareData) => {
        const processed = processProviders(jsonData.containsPlace);
        setData(processed);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading data:', err);
        setLoading(false);
      });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Get featured providers (first 3 hospitals)
  const featuredProviders = data
    .filter(p => p.category === 'Hospital')
    .slice(0, 3);

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
      <div className="bg-card border-b border-border sticky top-0 z-40 safe-top">
        <div className="container py-4">
          <h1 className="text-large-title text-foreground mb-1">
            Healthcare Directory
          </h1>
          <p className="text-subhead text-muted-foreground">
            Oneida County, NY
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-6 space-y-8">
        {/* Crisis Banner */}
        <CrisisBanner />

        {/* Search Bar */}
        <form onSubmit={handleSearch}>
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search providers, specialties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-2xl text-body focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm transition-all"
            />
          </div>
        </form>

        {/* Category Grid */}
        <div>
          <h2 className="text-title-2 text-foreground mb-4">
            Find Care
          </h2>
          <CategoryGrid />
        </div>

        {/* Featured Providers */}
        {featuredProviders.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-title-2 text-foreground">
                Hospitals
              </h2>
              <button
                onClick={() => setLocation('/search?category=Hospital')}
                className="text-subhead text-primary font-semibold"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {featuredProviders.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/20 shadow-sm">
          <h3 className="text-title-2 text-foreground mb-5">
            Directory Stats
          </h3>
          <div className="grid grid-cols-2 gap-5">
            <div className="bg-card rounded-xl p-4 shadow-sm">
              <div className="text-3xl font-bold text-primary mb-1">
                {data.length}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                Total Providers
              </div>
            </div>
            <div className="bg-card rounded-xl p-4 shadow-sm">
              <div className="text-3xl font-bold text-primary mb-1">
                {data.filter(p => p.category === 'Hospital').length}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                Hospitals
              </div>
            </div>
            <div className="bg-card rounded-xl p-4 shadow-sm">
              <div className="text-3xl font-bold text-primary mb-1">
                {data.filter(p => p.category === 'Urgent Care').length}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                Urgent Care
              </div>
            </div>
            <div className="bg-card rounded-xl p-4 shadow-sm">
              <div className="text-3xl font-bold text-primary mb-1">
                {data.filter(p => p.category !== 'Hospital' && p.category !== 'Urgent Care' && p.category !== 'Primary Care').length}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                Specialists
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <TabBar />
    </div>
  );
}
