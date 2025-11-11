import { AlertCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CrisisBanner() {
  const handleCrisisCall = () => {
    window.location.href = 'tel:988';
  };

  return (
    <div className="crisis-banner">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-bold text-[17px] mb-1">In a Crisis?</h3>
          <p className="text-[15px] opacity-95 mb-3">
            If you or someone you know is in immediate danger, call 988 for 24/7 crisis support.
          </p>
          <Button
            onClick={handleCrisisCall}
            className="bg-white text-alert hover:bg-white/90 font-semibold rounded-lg px-4 py-2 flex items-center gap-2"
          >
            <Phone className="w-4 h-4" />
            Call 988 Now
          </Button>
        </div>
      </div>
    </div>
  );
}
