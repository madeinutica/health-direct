import { MapPin, Phone, Building2, ChevronRight } from 'lucide-react';
import { Link } from 'wouter';
import type { ProcessedProvider } from '@/lib/types';

interface ProviderCardProps {
  provider: ProcessedProvider;
}

export default function ProviderCard({ provider }: ProviderCardProps) {
  return (
    <Link href={`/provider/${provider.id}`}>
      <div className="provider-card cursor-pointer">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Provider name */}
            <h3 className="text-body font-semibold text-foreground mb-1 truncate">
              {provider.name}
            </h3>
            
            {/* Category badge */}
            <div className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 mb-2">
              <span className="text-caption font-medium text-primary">
                {provider.category}
              </span>
            </div>
            
            {/* Location */}
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="text-subhead truncate">{provider.location}</span>
            </div>
            
            {/* Affiliation */}
            {provider.organization && (
              <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
                <Building2 className="w-4 h-4 flex-shrink-0" />
                <span className="text-caption truncate">{provider.organization}</span>
              </div>
            )}
            
            {/* Specialties preview */}
            {provider.specialties.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {provider.specialties.slice(0, 3).map((specialty, idx) => (
                  <span
                    key={idx}
                    className="text-caption px-2 py-0.5 rounded bg-muted text-muted-foreground"
                  >
                    {specialty}
                  </span>
                ))}
                {provider.specialties.length > 3 && (
                  <span className="text-caption text-muted-foreground">
                    +{provider.specialties.length - 3} more
                  </span>
                )}
              </div>
            )}

            {/* Insurance Badges */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {provider.acceptsMedicaid && (
                <span className="text-caption px-2 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                  Medicaid
                </span>
              )}
              {provider.acceptsMedicare && (
                <span className="text-caption px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  Medicare
                </span>
              )}
              {provider.network && provider.network !== 'Independent' && (
                <span className="text-caption px-2 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                  {provider.network}
                </span>
              )}
            </div>

          </div>
          
          {/* Chevron */}
          <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
        </div>
      </div>
    </Link>
  );
}