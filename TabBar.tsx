import { Home, Map, Search, Sparkles } from 'lucide-react';
import { useLocation, Link } from 'wouter';

export default function TabBar() {
  const [location] = useLocation();

  const tabs = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'map', label: 'Map', icon: Map, path: '/map' },
    { id: 'search', label: 'Search', icon: Search, path: '/search' },
    { id: 'assistant', label: 'Assistant', icon: Sparkles, path: '/assistant' },
  ];

  return (
    <div className="tab-bar">
      <div className="flex items-center justify-around max-w-2xl mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location === tab.path;
          
          return (
            <Link key={tab.id} href={tab.path}>
              <button className={`tab-button ${isActive ? 'active' : ''}`}>
                <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
