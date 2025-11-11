import DirectorySearch from '@/components/DirectorySearch'
import Navigation from '@/components/Navigation'

export default function DirectoryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Page Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Healthcare Provider Directory
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find trusted healthcare providers in Oneida County, NY. Search by specialty, location, or provider name.
            </p>
          </div>
        </div>
      </div>

      {/* Directory Search Component */}
      <DirectorySearch />
    </div>
  )
}