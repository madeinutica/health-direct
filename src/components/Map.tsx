'use client'

import { useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { HealthcareProvider } from '@/types'

// Initialize Mapbox
if (typeof window !== 'undefined') {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''
}

interface MapProps {
  providers?: HealthcareProvider[]
  selectedProvider?: HealthcareProvider
  onProviderClick?: (provider: HealthcareProvider) => void
  height?: string
  className?: string
}

export default function Map({ 
  providers = [], 
  selectedProvider, 
  onProviderClick,
  height = '400px',
  className = ''
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markers = useRef<mapboxgl.Marker[]>([])
  const onProviderClickRef = useRef(onProviderClick)
  const [isLoaded, setIsLoaded] = useState(false)

  // Update the ref when the callback changes
  useEffect(() => {
    onProviderClickRef.current = onProviderClick
  }, [onProviderClick])

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    // Oneida County, NY coordinates
    const DEFAULT_CENTER: [number, number] = [-75.2326, 43.1009]
    const DEFAULT_ZOOM = 10

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM
    })

    map.current.on('load', () => {
      setIsLoaded(true)
    })

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  // Update markers when providers change
  useEffect(() => {
    if (!map.current || !isLoaded) return

    // Clear existing markers
    markers.current.forEach(marker => marker.remove())
    markers.current = []

    // Add new markers
    providers.forEach((provider) => {
      const address = Array.isArray(provider.address) ? provider.address[0] : provider.address
      
      // Get stable coordinates for the provider
      const coordinates = getCoordinatesForProvider(provider)
      if (!coordinates) return

      // Create marker element
      const markerEl = document.createElement('div')
      markerEl.className = 'mapbox-marker'
      markerEl.style.cssText = `
        width: 32px;
        height: 32px;
        border-radius: 50%;
        cursor: pointer;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
        color: white;
        ${getMarkerStyle(provider)}
      `
      markerEl.textContent = getMarkerIcon(provider.type)

      // Create popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false
      }).setHTML(`
        <div class="p-3">
          <h3 class="font-semibold text-gray-900 mb-1">${provider.name}</h3>
          <p class="text-sm text-gray-600 mb-2">${address.addressLocality}, ${address.addressRegion}</p>
          <div class="flex items-center space-x-2 text-xs">
            ${provider.isEmergency ? '<span class="px-2 py-1 bg-red-100 text-red-700 rounded">Emergency</span>' : ''}
            ${provider.is24Hours ? '<span class="px-2 py-1 bg-green-100 text-green-700 rounded">24/7</span>' : ''}
          </div>
          ${provider.medicalSpecialty && provider.medicalSpecialty.length > 0 ? `
            <div class="mt-2">
              <div class="flex flex-wrap gap-1">
                ${provider.medicalSpecialty.slice(0, 3).map((specialty: string) => 
                  `<span class="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">${specialty}</span>`
                ).join('')}
              </div>
            </div>
          ` : ''}
          ${provider.rating ? `
            <div class="flex items-center mt-2">
              <span class="text-yellow-400">★</span>
              <span class="text-sm text-gray-600 ml-1">${provider.rating} (${provider.reviewCount} reviews)</span>
            </div>
          ` : ''}
        </div>
      `)

      // Create marker
      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat(coordinates)
        .setPopup(popup)
        .addTo(map.current!)

      // Add click handler
      markerEl.addEventListener('click', (e) => {
        e.stopPropagation()
        onProviderClickRef.current?.(provider)
      })

      markers.current.push(marker)
    })

    // Fit map to show all markers (only if there are multiple providers)
    if (providers.length > 1) {
      const coordinates = providers.map(p => getCoordinatesForProvider(p)).filter(Boolean)
      if (coordinates.length > 1) {
        const bounds = new mapboxgl.LngLatBounds()
        coordinates.forEach(coord => bounds.extend(coord!))
        map.current.fitBounds(bounds, { padding: 50 })
      }
    }
  }, [providers, isLoaded]) // Removed onProviderClick from dependencies to prevent re-renders

  // Highlight selected provider
  useEffect(() => {
    if (!selectedProvider) return

    const coordinates = getCoordinatesForProvider(selectedProvider)
    if (coordinates && map.current) {
      map.current.flyTo({
        center: coordinates,
        zoom: 14,
        duration: 1000
      })
    }
  }, [selectedProvider])

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <div ref={mapContainer} className="w-full h-full rounded-lg overflow-hidden" />
      
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      )}
      
      {!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center p-4">
            <p className="text-sm text-gray-600">Map requires Mapbox access token</p>
            <p className="text-xs text-gray-500 mt-1">Add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to .env.local</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper functions for coordinates
function getCoordinatesForProvider(provider: HealthcareProvider): [number, number] | null {
  // First try to use geocoded coordinates from database
  if (provider.latitude && provider.longitude) {
    return [provider.longitude, provider.latitude]
  }

  // Fallback to address-based lookup for providers without geocoded coordinates
  const address = Array.isArray(provider.address) ? provider.address[0] : provider.address
  
  // Oneida County, NY coordinates (default center)
  const DEFAULT_CENTER: [number, number] = [-75.2326, 43.1009]
  
  // Mock coordinates for Oneida County locations
  const locationMap: { [key: string]: [number, number] } = {
    'Utica': [-75.2326, 43.1009],
    'Rome': [-75.4557, 43.2128],
    'Oneida': [-75.6513, 43.0923],
    'New Hartford': [-75.2868, 43.0734],
    'Camden': [-75.7490, 43.3312],
    'Whitesboro': [-75.2915, 43.1223],
    'Waterville': [-75.3779, 42.9312],
    'Boonville': [-75.3365, 43.4834]
  }
  
  const city = address?.addressLocality || ''
  const baseCoords = locationMap[city] || DEFAULT_CENTER
  
  // Use stable hash-based offset to avoid overlapping markers
  // This ensures coordinates are consistent across renders
  const hash = simpleHash(provider.id + provider.name)
  const offset = 0.005
  return [
    baseCoords[0] + ((hash % 1000) / 1000 - 0.5) * offset,
    baseCoords[1] + (((hash / 1000) % 1000) / 1000 - 0.5) * offset
  ]
}

// Simple hash function for consistent coordinate offsets
function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

function getMarkerStyle(provider: HealthcareProvider): string {
  if (provider.isEmergency) return 'background-color: #ef4444;' // Red for emergency
  
  switch (provider.type) {
    case 'Hospital':
      return 'background-color: #2563eb;' // Blue
    case 'MedicalClinic':
      return 'background-color: #16a34a;' // Green
    case 'Physician':
      return 'background-color: #7c3aed;' // Purple
    case 'MedicalCenter':
      return 'background-color: #ea580c;' // Orange
    case 'MedicalLaboratory':
      return 'background-color: #0891b2;' // Cyan
    default:
      return 'background-color: #6b7280;' // Gray
  }
}

function getMarkerIcon(type: HealthcareProvider['type']): string {
  switch (type) {
    case 'Hospital':
      return 'H'
    case 'MedicalClinic':
      return 'C'
    case 'Physician':
      return 'Dr'
    case 'MedicalCenter':
      return 'M'
    case 'MedicalLaboratory':
      return 'L'
    default:
      return '+'
  }
}