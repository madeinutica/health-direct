import { Hospital, Clock, Heart, Brain, FlaskConical, Users, Bone, Activity, Baby } from 'lucide-react';
import { useLocation } from 'wouter';

interface Category {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  color: string;
  filter: string;
}

const categories: Category[] = [
  {
    id: 'hospitals',
    label: 'Hospitals',
    icon: Hospital,
    color: 'text-blue-600',
    filter: 'Hospital',
  },
  {
    id: 'urgent-care',
    label: 'Urgent Care',
    icon: Clock,
    color: 'text-orange-600',
    filter: 'Urgent Care',
  },
  {
    id: 'primary-care',
    label: 'Primary Care',
    icon: Users,
    color: 'text-green-600',
    filter: 'Primary Care',
  },
  {
    id: 'maternity',
    label: 'Maternity & Women\'s Health',
    icon: Heart,
    color: 'text-pink-600',
    filter: 'Maternity & Women\'s Health',
  },
  {
    id: 'mental-health',
    label: 'Mental Health',
    icon: Brain,
    color: 'text-purple-600',
    filter: 'Mental Health & Behavioral',
  },
  {
    id: 'cardiology',
    label: 'Heart Care',
    icon: Heart,
    color: 'text-red-600',
    filter: 'Cardiology & Heart Care',
  },
  {
    id: 'orthopedics',
    label: 'Bone & Joint',
    icon: Bone,
    color: 'text-cyan-600',
    filter: 'Orthopedics & Bone Care',
  },
  {
    id: 'cancer',
    label: 'Cancer Care',
    icon: Activity,
    color: 'text-indigo-600',
    filter: 'Cancer Care & Oncology',
  },
  {
    id: 'pediatrics',
    label: 'Child Care',
    icon: Baby,
    color: 'text-emerald-600',
    filter: 'Pediatrics & Child Care',
  },
  {
    id: 'lab-imaging',
    label: 'Lab & Imaging',
    icon: FlaskConical,
    color: 'text-teal-600',
    filter: 'Imaging & Lab',
  },
];

export default function CategoryGrid() {
  const [, setLocation] = useLocation();

  const handleCategoryClick = (filter: string) => {
    setLocation(`/search?category=${encodeURIComponent(filter)}`);
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {categories.map((category) => {
        const Icon = category.icon;
        return (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.filter)}
            className="category-card"
          >
            <div className={`${category.color} bg-opacity-10 rounded-full p-4`}>
              <Icon className={`w-8 h-8 ${category.color}`} strokeWidth={2} />
            </div>
            <span className="text-subhead font-semibold text-foreground text-center">
              {category.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
