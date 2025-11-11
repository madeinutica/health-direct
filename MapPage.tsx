import { useState, useEffect } from 'react';
import { MapPin, Navigation, Search } from 'lucide-react';
import TabBar from '@/components/TabBar';
import type { ProcessedProvider, HealthcareData } from '@/lib/types';
import { processProviders } from '@/lib/dataUtils';

export default function MapPage() {
  const [providers, setProviders] = useState<ProcessedProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<ProcessedProvider | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data.json')
      .then(res => res.json())
      .then((data: HealthcareData) => {
        const processed = processProviders(data.containsPlace);
        setProviders(processed);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading data:', err);
        setLoading(false);
      });
  }, []);

  const filteredProviders = providers.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get unique locations for markers
  const providersByLocation = filteredProviders.reduce((acc, provider) => {
    const loc = provider.location;
    if (!acc[loc]) acc[loc] = [];
    acc[loc].push(provider);
    return acc;
  }, {} as Record<string, ProcessedProvider[]>);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pb-tab-safe">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-subhead text-muted-foreground">Loading map...</p>
        </div>
        <TabBar />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background pb-tab-safe">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-4 sticky top-0 z-10 shadow-sm">
        <h1 className="text-title1 font-bold text-foreground mb-3">Map View</h1>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search providers or locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-body focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
        </div>
      </div>

      {/* Map Container with Placeholder */}
      <div className="relative flex-1 bg-muted min-h-[500px]">
        {/* 
          IFRAME PLACEHOLDER FOR MAP
          Replace this entire div with your map implementation later
          Example: <iframe src="your-map-url" className="w-full h-full" />
        */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800">
          {/* Grid pattern for map feel */}
          <div className="absolute inset-0 opacity-5">
            <div className="h-full w-full" style={{
              backgroundImage: `
                linear-gradient(to right, #94a3b8 1px, transparent 1px),
                linear-gradient(to bottom, #94a3b8 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px'
            }}></div>
          </div>

          {/* Placeholder Text */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-lg border border-border">
            <p className="text-sm text-muted-foreground flex items-center gap-2 font-medium">
              <MapPin className="w-4 h-4 text-primary" />
              {filteredProviders.length} healthcare providers
            </p>
          </div>

          {/* Provider Markers - Simulated positions */}
          {Object.entries(providersByLocation).slice(0, 12).map(([location, provs], index) => {
            // Generate pseudo-random positions for demo
            const top = 15 + (index * 7) % 65;
            const left = 10 + (index * 11) % 80;
            
            return (
              <button
                key={location}
                onClick={() => setSelectedProvider(provs[0])}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-125 hover:z-10 focus:outline-none focus:scale-125"
                style={{ top: `${top}%`, left: `${left}%` }}
                aria-label={`View ${location} providers`}
              >
                <div className="relative">
                  {/* Marker Pin */}
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center shadow-xl border-2 border-white ${
                    provs[0].category === 'Hospital' 
                      ? 'bg-blue-500' 
                      : provs[0].category === 'Urgent Care'
                      ? 'bg-orange-500'
                      : provs[0].category.includes('Mental Health')
                      ? 'bg-purple-500'
                      : 'bg-primary'
                  }`}>
                    <MapPin className="w-5 h-5 text-white" fill="white" />
                  </div>
                  {/* Count Badge */}
                  {provs.length > 1 && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-md border-2 border-white">
                      {provs.length}
                    </div>
                  )}
                  {/* Location Label */}
                  <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white dark:bg-gray-800 px-2 py-1 rounded shadow-md text-xs font-semibold text-foreground opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                    {location}
                  </div>
                </div>
              </button>
            );
          })}

          {/* Center/Location Button */}
          <button 
            className="absolute bottom-6 right-4 w-14 h-14 bg-white dark:bg-gray-800 rounded-full shadow-2xl flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-all hover:scale-110 border border-border"
            aria-label="Center map on my location"
          >
            <Navigation className="w-6 h-6 text-primary" />
          </button>
        </div>
      </div>

      {/* Selected Provider Card */}
      {selectedProvider && (
        <div className="absolute bottom-20 left-0 right-0 mx-4 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                    {selectedProvider.category}
                  </span>
                  {selectedProvider.network && (
                    <span className="px-2.5 py-1 bg-secondary/10 text-secondary-foreground text-xs font-semibold rounded-full">
                      {selectedProvider.network}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">{selectedProvider.name}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  {selectedProvider.location}
                </p>
              </div>
              <button
                onClick={() => setSelectedProvider(null)}
                className="text-muted-foreground hover:text-foreground transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted"
                aria-label="Close"
              >
                <span className="text-xl">×</span>
              </button>
            </div>

            {selectedProvider.organization && (
              <p className="text-sm text-muted-foreground mb-4 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-primary"></span>
                {selectedProvider.organization}
              </p>
            )}

            <div className="flex gap-3">
              <a
                href={`tel:${selectedProvider.phone}`}
                className="flex-1 bg-primary text-primary-foreground py-3 px-4 rounded-xl font-bold text-center hover:opacity-90 transition-all hover:shadow-lg text-sm"
              >
                📞 Call
              </a>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedProvider.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-secondary text-secondary-foreground py-3 px-4 rounded-xl font-bold text-center hover:opacity-90 transition-all hover:shadow-lg text-sm"
              >
                🧭 Directions
              </a>
            </div>
          </div>
        </div>
      )}

      <TabBar />
    </div>
  );
}
