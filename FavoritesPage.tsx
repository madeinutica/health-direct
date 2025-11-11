import { useState, useEffect } from 'react';
import TabBar from '@/components/TabBar';
import ProviderCard from '@/components/ProviderCard';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { processProviders } from '@/lib/dataUtils';
import type { HealthcareData, ProcessedProvider } from '@/lib/types';

export default function FavoritesPage() {
  const [, setLocation] = useLocation();
  const [favorites, setFavorites] = useState<ProcessedProvider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const favoriteIds = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    if (favoriteIds.length === 0) {
      setLoading(false);
      return;
    }

    fetch('/data.json')
      .then(res => res.json())
      .then((jsonData: HealthcareData) => {
        const processed = processProviders(jsonData.containsPlace);
        const favoriteProviders = processed.filter(p => favoriteIds.includes(p.id));
        setFavorites(favoriteProviders);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading favorites:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pb-tab-safe">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-subhead text-muted-foreground">Loading...</p>
        </div>
        <TabBar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-tab-safe">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container py-4">
          <h1 className="text-large-title text-foreground mb-1">
            Favorites
          </h1>
          <p className="text-subhead text-muted-foreground">
            {favorites.length} {favorites.length === 1 ? 'provider' : 'providers'} saved
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container py-6">
        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">❤️</div>
            <h2 className="text-title-1 text-foreground mb-2">
              No Favorites Yet
            </h2>
            <p className="text-body text-muted-foreground mb-6 max-w-sm mx-auto">
              Save your preferred healthcare providers for quick access
            </p>
            <Button onClick={() => setLocation('/search')}>
              Browse Providers
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {favorites.map((provider) => (
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
