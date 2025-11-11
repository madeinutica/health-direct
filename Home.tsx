import { useEffect, useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Stethoscope, 
  Phone, 
  MapPin, 
  ExternalLink,
  Search,
  Hospital,
  Clock,
  Heart,
  Brain
} from 'lucide-react';
import type { HealthcareData, ProcessedProvider } from '@/lib/types';
import { 
  processProviders, 
  getUniqueLocations, 
  getUniqueCategories,
  getCategoryCounts,
  getLocationCounts,
  filterProviders 
} from '@/lib/dataUtils';

declare const Chart: any;

export default function Home() {
  const [data, setData] = useState<ProcessedProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredData, setFilteredData] = useState<ProcessedProvider[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [locations, setLocations] = useState<string[]>(['All']);
  const [categories, setCategories] = useState<string[]>([]);
  
  const categoryChartRef = useRef<HTMLCanvasElement>(null);
  const locationChartRef = useRef<HTMLCanvasElement>(null);
  const categoryChartInstance = useRef<any>(null);
  const locationChartInstance = useRef<any>(null);

  // Load data
  useEffect(() => {
    console.log('Fetching data...');
    setLoading(true);
    fetch('/data.json')
      .then(res => {
        console.log('Response received:', res.status);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((jsonData: HealthcareData) => {
        console.log('Data parsed, providers:', jsonData.containsPlace?.length);
        if (!jsonData.containsPlace || jsonData.containsPlace.length === 0) {
          throw new Error('No providers found in data');
        }
        const processed = processProviders(jsonData.containsPlace);
        console.log('Processed providers:', processed.length);
        setData(processed);
        setFilteredData(processed);
        setLocations(getUniqueLocations(processed));
        setCategories(getUniqueCategories(processed));
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading data:', err);
        setError(err.message || 'Failed to load data');
        setLoading(false);
      });
  }, []);

  // Filter data when search/filters change
  useEffect(() => {
    const filtered = filterProviders(data, searchTerm, selectedCategory, selectedLocation);
    setFilteredData(filtered);
  }, [data, searchTerm, selectedCategory, selectedLocation]);

  // Initialize charts
  useEffect(() => {
    if (data.length === 0) return;
    
    // Wait for Chart.js to be available
    if (typeof (window as any).Chart === 'undefined') {
      console.log('Chart.js not loaded yet');
      return;
    }
    
    const Chart = (window as any).Chart;

    const categoryCounts = getCategoryCounts(data);
    const locationCounts = getLocationCounts(data);

    // Category Donut Chart
    if (categoryChartRef.current) {
      if (categoryChartInstance.current) {
        categoryChartInstance.current.destroy();
      }

      const ctx = categoryChartRef.current.getContext('2d');
      if (ctx) {
        categoryChartInstance.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: Object.keys(categoryCounts),
            datasets: [{
              data: Object.values(categoryCounts),
              backgroundColor: [
                'rgba(14, 165, 233, 0.8)',   // sky-500
                'rgba(251, 191, 36, 0.8)',   // amber-400
                'rgba(20, 184, 166, 0.8)',   // teal-500
                'rgba(239, 68, 68, 0.8)',    // red-500
                'rgba(168, 85, 247, 0.8)',   // purple-500
                'rgba(34, 197, 94, 0.8)',    // green-500
                'rgba(249, 115, 22, 0.8)',   // orange-500
                'rgba(236, 72, 153, 0.8)',   // pink-500
              ],
              borderWidth: 2,
              borderColor: '#fff'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  padding: 15,
                  font: {
                    size: 12
                  }
                }
              },
              tooltip: {
                callbacks: {
                  label: function(context: any) {
                    const label = context.label || '';
                    const value = context.parsed || 0;
                    const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                    const percentage = ((value / total) * 100).toFixed(1);
                    return `${label}: ${value} (${percentage}%)`;
                  }
                }
              }
            }
          }
        });
      }
    }

    // Location Bar Chart
    if (locationChartRef.current) {
      if (locationChartInstance.current) {
        locationChartInstance.current.destroy();
      }

      const ctx = locationChartRef.current.getContext('2d');
      if (ctx) {
        locationChartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: Object.keys(locationCounts),
            datasets: [{
              label: 'Number of Providers',
              data: Object.values(locationCounts),
              backgroundColor: 'rgba(14, 165, 233, 0.8)',
              borderColor: 'rgba(14, 165, 233, 1)',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 5
                }
              }
            }
          }
        });
      }
    }

    return () => {
      if (categoryChartInstance.current) {
        categoryChartInstance.current.destroy();
      }
      if (locationChartInstance.current) {
        locationChartInstance.current.destroy();
      }
    };
  }, [data]);

  const handleQuickFilter = (category: string) => {
    setSelectedCategory(category);
    setSearchTerm('');
    setSelectedLocation('All');
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <nav className="bg-card shadow-sm sticky top-0 z-50 border-b">
          <div className="container">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-2">
                <Hospital className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold text-primary">Oneida County Healthcare</span>
              </div>
            </div>
          </div>
        </nav>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Loading healthcare providers...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <nav className="bg-card shadow-sm sticky top-0 z-50 border-b">
          <div className="container">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-2">
                <Hospital className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold text-primary">Oneida County Healthcare</span>
              </div>
            </div>
          </div>
        </nav>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Error Loading Data</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Reload Page</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <nav className="bg-card shadow-sm sticky top-0 z-50 border-b">
        <div className="container">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Hospital className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-primary">Oneida County Healthcare</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <header className="bg-card border-b">
        <div className="container py-12 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">
            Healthcare Directory
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            An interactive guide to medical facilities and specialists in Oneida County. 
            Find hospitals, urgent care, specialists, and more in Utica, Rome, and surrounding areas.
          </p>
        </div>
      </header>

      <main className="container py-8">
        {/* Quick Access */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-center text-foreground mb-8">Quick Access</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <Button
              variant="outline"
              className="h-auto p-6 flex flex-col items-center gap-2 hover:bg-sky-50 hover:border-sky-300 transition-all"
              onClick={() => handleQuickFilter('Hospital')}
            >
              <Hospital className="h-12 w-12 text-sky-600" />
              <span className="text-xl font-semibold text-sky-700">Hospitals</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto p-6 flex flex-col items-center gap-2 hover:bg-amber-50 hover:border-amber-300 transition-all"
              onClick={() => handleQuickFilter('Urgent Care')}
            >
              <Clock className="h-12 w-12 text-amber-600" />
              <span className="text-xl font-semibold text-amber-700">Urgent Care</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto p-6 flex flex-col items-center gap-2 hover:bg-red-50 hover:border-red-300 transition-all"
              onClick={() => handleQuickFilter('Emergency')}
            >
              <Heart className="h-12 w-12 text-red-600" />
              <span className="text-xl font-semibold text-red-700">Emergency</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto p-6 flex flex-col items-center gap-2 hover:bg-teal-50 hover:border-teal-300 transition-all"
              onClick={() => handleQuickFilter('Mental Health')}
            >
              <Brain className="h-12 w-12 text-teal-600" />
              <span className="text-xl font-semibold text-teal-700">Crisis & Mental Health</span>
            </Button>
          </div>
        </section>

        {/* Dashboard Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-center text-foreground mb-8">
            County Healthcare Overview
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="text-2xl">Find a Provider</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Search */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Search by Name or Specialty
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="e.g., Cardiology, WellNow, Wynn"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Location Filter */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Filter by Location
                    </label>
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {locations.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>

                  {/* Category Filters */}
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">Filter by Category</h4>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className={`filter-btn ${selectedCategory === 'All' ? 'active' : ''}`}
                        onClick={() => handleCategoryClick('All')}
                      >
                        All
                      </Button>
                      {categories.map(cat => (
                        <Button
                          key={cat}
                          variant="outline"
                          size="sm"
                          className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                          onClick={() => handleCategoryClick(cat)}
                        >
                          {cat}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-center">Provider Types</CardTitle>
                  <CardDescription className="text-center">
                    A breakdown of the different healthcare service categories available in the county.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="chart-container">
                    <canvas ref={categoryChartRef}></canvas>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-center">Services by Location</CardTitle>
                  <CardDescription className="text-center">
                    This chart shows the concentration of services in the county's primary locations.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="chart-container">
                    <canvas ref={locationChartRef}></canvas>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Listings */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-foreground">Directory Results</h2>
            <span className="text-lg text-muted-foreground font-medium">
              {filteredData.length} {filteredData.length === 1 ? 'provider' : 'providers'}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.map(provider => (
              <Card key={provider.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-xl">{provider.name}</CardTitle>
                    {provider.type === 'Hospital' ? (
                      <Hospital className="h-5 w-5 text-primary flex-shrink-0" />
                    ) : (
                      <Stethoscope className="h-5 w-5 text-primary flex-shrink-0" />
                    )}
                  </div>
                  <Badge variant="secondary" className="w-fit">
                    {provider.category}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  {provider.organization && (
                    <div className="flex items-start gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{provider.organization}</span>
                    </div>
                  )}
                  
                  {provider.address && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{provider.address}</span>
                    </div>
                  )}
                  
                  {provider.phone && (
                    <div className="flex items-start gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <a 
                        href={`tel:${provider.phone}`}
                        className="text-primary hover:underline"
                      >
                        {provider.phone}
                      </a>
                    </div>
                  )}
                  
                  {provider.specialties.length > 0 && (
                    <div className="pt-2">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Specialties:</p>
                      <div className="flex flex-wrap gap-1">
                        {provider.specialties.slice(0, 4).map((specialty, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                        {provider.specialties.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{provider.specialties.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {provider.website && (
                    <a
                      href={provider.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline pt-2"
                    >
                      Visit Website
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredData.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">
                No providers found matching your criteria. Try adjusting your filters.
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card mt-16 border-t">
        <div className="container py-8 text-center text-muted-foreground">
          <p>&copy; 2025 Oneida County Healthcare Directory. Data compiled for informational purposes.</p>
        </div>
      </footer>
    </div>
  );
}
