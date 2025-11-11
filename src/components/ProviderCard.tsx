'use client'

import Link from 'next/link'
import { MapPinIcon, PhoneIcon, ShieldCheckIcon, StarIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import type { ProcessedProvider } from '@/types'

interface ProviderCardProps {
  provider: ProcessedProvider
}

export default function ProviderCard({ provider }: ProviderCardProps) {
  return (
    <Link
      href={`/provider/${provider.id}`}
      className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-500 hover:shadow-lg transition-all"
    >
      {/* Category Badge */}
      <div className="flex items-start justify-between mb-2">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
          {provider.category}
        </span>
        {provider.rating && (
          <div className="flex items-center gap-1">
            <StarIconSolid className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-semibold text-gray-900">{provider.rating.toFixed(1)}</span>
            {provider.reviewCount && (
              <span className="text-xs text-gray-500">({provider.reviewCount})</span>
            )}
          </div>
        )}
      </div>

      {/* Provider Name */}
      <h3 className="text-lg font-bold text-gray-900 mb-1">
        {provider.name}
      </h3>

      {/* Organization */}
      {provider.organization && (
        <p className="text-sm text-gray-600 mb-3">
          {provider.organization}
        </p>
      )}

      {/* Specialties */}
      {provider.specialties.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {provider.specialties.slice(0, 3).map((specialty, idx) => (
            <span
              key={idx}
              className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-md"
            >
              {specialty}
            </span>
          ))}
          {provider.specialties.length > 3 && (
            <span className="text-xs px-2 py-1 text-gray-500">
              +{provider.specialties.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Location & Contact */}
      <div className="space-y-2">
        {provider.location && (
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MapPinIcon className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-600" />
            <span>{provider.location}</span>
          </div>
        )}

        {provider.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <PhoneIcon className="w-4 h-4 flex-shrink-0 text-blue-600" />
            <span>{provider.phone}</span>
          </div>
        )}
      </div>

      {/* Insurance Badges */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
        <ShieldCheckIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
        <div className="flex flex-wrap gap-2">
          {provider.acceptsMedicaid && (
            <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
              Medicaid
            </span>
          )}
          {provider.acceptsMedicare && (
            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
              Medicare
            </span>
          )}
          {provider.acceptsInsurance.length > 0 && (
            <span className="text-xs text-gray-500">
              +{provider.acceptsInsurance.length} plans
            </span>
          )}
        </div>
      </div>

      {/* Emergency/24hrs Badges */}
      {(provider.isEmergency || provider.is24Hours) && (
        <div className="flex gap-2 mt-2">
          {provider.isEmergency && (
            <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-md font-medium">
              Emergency
            </span>
          )}
          {provider.is24Hours && (
            <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-md font-medium">
              24 Hours
            </span>
          )}
        </div>
      )}
    </Link>
  )
}
