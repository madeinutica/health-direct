import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { ArrowLeft, Phone, Navigation, MapPin, Building2, Heart, ExternalLink, Share2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { processProviders } from '@/lib/dataUtils';
import type { HealthcareData, ProcessedProvider } from '@/lib/types';

export default function ProviderDetail() {
  const [, params] = useRoute('/provider/:id');
  const [, setLocation] = useLocation();
  const [provider, setProvider] = useState<ProcessedProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!params?.id) return;

    fetch('/data.json')
      .then(res => res.json())
      .then((jsonData: HealthcareData) => {
        const processed = processProviders(jsonData.containsPlace);
        const found = processed.find(p => p.id === params.id);
        setProvider(found || null);
        setLoading(false);

        // Check if favorited
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        setIsFavorite(favorites.includes(params.id));
      })
      .catch(err => {
        console.error('Error loading provider:', err);
        setLoading(false);
      });
  }, [params?.id]);

  const handleCall = () => {
    if (provider?.phone) {
      window.location.href = `tel:${provider.phone}`;
    }
  };

  const handleDirections = () => {
    if (provider?.address) {
      const query = encodeURIComponent(provider.address);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    }
  };

  const toggleFavorite = () => {
    if (!params?.id) return;

    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    let newFavorites;

    if (isFavorite) {
      newFavorites = favorites.filter((id: string) => id !== params.id);
    } else {
      newFavorites = [...favorites, params.id];
    }

    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };

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

  if (!provider) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-title-1 text-foreground mb-2">Provider Not Found</h2>
          <Button onClick={() => setLocation('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.history.back()}
              className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-foreground" />
            </button>
            <button
              onClick={toggleFavorite}
              className="p-2 -mr-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Heart
                className={`w-6 h-6 ${isFavorite ? 'fill-alert text-alert' : 'text-foreground'}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-6 space-y-6">
        {/* Provider Info */}
        <div>
          <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-primary/10 mb-3">
            <span className="text-subhead font-semibold text-primary">
              {provider.category}
            </span>
          </div>
          
          <h1 className="text-title-1 text-foreground mb-2">
            {provider.name}
          </h1>

          {provider.organization && (
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <Building2 className="w-5 h-5" />
              <span className="text-body">{provider.organization}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <button 
            onClick={handleCall} 
            className="flex flex-col items-center justify-center py-4 bg-primary text-primary-foreground rounded-2xl hover:opacity-90 transition-all hover:shadow-lg"
          >
            <Phone className="w-6 h-6 mb-2" />
            <span className="text-sm font-bold">Call</span>
          </button>
          <button 
            onClick={handleDirections} 
            className="flex flex-col items-center justify-center py-4 bg-secondary text-secondary-foreground rounded-2xl hover:opacity-90 transition-all hover:shadow-lg"
          >
            <Navigation className="w-6 h-6 mb-2" />
            <span className="text-sm font-bold">Directions</span>
          </button>
          <button 
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: provider.name,
                  text: `Check out ${provider.name} in Oneida County Healthcare Directory`,
                  url: window.location.href
                });
              }
            }}
            className="flex flex-col items-center justify-center py-4 bg-muted text-foreground rounded-2xl hover:bg-muted/80 transition-all hover:shadow-lg"
          >
            <Share2 className="w-6 h-6 mb-2" />
            <span className="text-sm font-bold">Share</span>
          </button>
        </div>

        {/* Contact Info */}
        <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
          <h2 className="text-title-2 text-foreground">Contact Information</h2>
          
          {provider.phone && (
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-caption text-muted-foreground mb-1">Phone</div>
                <a href={`tel:${provider.phone}`} className="text-body text-foreground font-medium">
                  {provider.phone}
                </a>
              </div>
            </div>
          )}

          {provider.address && (
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-caption text-muted-foreground mb-1">Address</div>
                <p className="text-body text-foreground">{provider.address}</p>
              </div>
            </div>
          )}

          {provider.website && (
            <div className="flex items-start gap-3">
              <ExternalLink className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-caption text-muted-foreground mb-1">Website</div>
                <a
                  href={provider.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-body text-primary font-medium"
                >
                  Visit Website
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Specialties */}
        {provider.specialties.length > 0 && (
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h2 className="text-title-2 text-foreground mb-4">Specialties</h2>
            <div className="flex flex-wrap gap-2">
              {provider.specialties.map((specialty, idx) => (
                <span
                  key={idx}
                  className="px-3 py-2 rounded-lg bg-primary/10 text-primary text-subhead font-medium"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Services */}
        {provider.services.length > 0 && (
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h2 className="text-title-2 text-foreground mb-4">Services</h2>
            <ul className="space-y-2">
              {provider.services.map((service, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span className="text-body text-foreground">{service}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Insurance Information */}
        {provider.acceptsInsurance && provider.acceptsInsurance.length > 0 && (
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="text-title-2 text-foreground">Insurance Accepted</h2>
            </div>
            
            {provider.network && (
              <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                <div className="text-caption text-muted-foreground mb-1">Network</div>
                <div className="text-body font-semibold text-primary">{provider.network}</div>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mb-4">
              {provider.acceptsMedicaid && (
                <span className="px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-semibold">
                  ✓ Medicaid
                </span>
              )}
              {provider.acceptsMedicare && (
                <span className="px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold">
                  ✓ Medicare
                </span>
              )}
            </div>

            <details className="group">
              <summary className="cursor-pointer text-sm font-semibold text-primary hover:underline list-none flex items-center justify-between">
                <span>View all accepted plans ({provider.acceptsInsurance.length})</span>
                <span className="group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {provider.acceptsInsurance.map((insurance, idx) => (
                  <div key={idx} className="text-sm text-foreground py-2 px-3 bg-muted rounded-lg">
                    {insurance}
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
