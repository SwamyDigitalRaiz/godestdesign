import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ChevronRight,
  Wind,
  Users,
  Shield,
  Luggage,
  Music,
  Dog,
  CigaretteOff,
  MessageSquare,
  Zap,
  Plus,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Switch } from '../../../components/ui/switch';
import { Badge } from '../../../components/ui/badge';
import { useToast } from '../../../components/ui/toaster';

const INITIAL_AMENITIES = [
  { id: 'am-1', name: 'Air Conditioning (AC)', code: 'ac', icon: Wind, desc: 'Cool cabin temperature throughout journey', active: true, isPopular: true },
  { id: 'am-2', name: 'Max 2 in Rear Seat', code: 'max_two_rear', icon: Users, desc: 'Guarantees middle seat remains empty for extra comfort', active: true, isPopular: true },
  { id: 'am-3', name: 'Ladies Only Carpool', code: 'ladies_only', icon: Shield, desc: 'Exclusive for women hosts and female co-passengers', active: true, isPopular: true },
  { id: 'am-4', name: 'Boot Space for Large Luggage', code: 'luggage', icon: Luggage, desc: 'Dedicated trunk space for suitcases or backpacks', active: true, isPopular: false },
  { id: 'am-5', name: 'No Smoking Cabin', code: 'no_smoking', icon: CigaretteOff, desc: 'Strict non-smoking rule for clean air', active: true, isPopular: false },
  { id: 'am-6', name: 'Music & Podcasts Allowed', code: 'music', icon: Music, desc: 'Shared road-trip music playlist and AUX audio', active: true, isPopular: false },
  { id: 'am-7', name: 'Pet Friendly', code: 'pets', icon: Dog, desc: 'Well-behaved domestic pets allowed in carrier', active: false, isPopular: false },
  { id: 'am-8', name: 'Quiet / Work-Friendly Ride', code: 'quiet', icon: MessageSquare, desc: 'Peaceful quiet cabin for working or resting', active: true, isPopular: false },
  { id: 'am-9', name: 'Instant Booking Enabled', code: 'instant_book', icon: Zap, desc: 'Rider can book immediately without waiting for host reply', active: true, isPopular: true },
];

export function CarpoolAmenitiesPage() {
  const { toast } = useToast();
  const [amenities, setAmenities] = useState(INITIAL_AMENITIES);

  const toggleAmenity = (id) => {
    setAmenities(amenities.map(a => a.id === id ? { ...a, active: !a.active } : a));
    toast({ title: 'Amenity Updated', description: 'Changes saved for carpool publishing.' });
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
            <ChevronRight className="h-3 w-3" />
            <span>Car Pool</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-900 dark:text-white font-medium">Amenities & Travel Rules</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-primary" />
            Carpool Amenities & Travel Comfort Rules
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Configure amenity tags, rear-seat comfort standards, ladies-only rides, and luggage policies.
          </p>
        </div>

        <Link to="/carpool/pricing">
          <Button variant="outline" size="sm">
            Seat Fare Matrix
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {amenities.map((item) => {
          const IconComponent = item.icon;
          return (
            <Card key={item.id} className="border shadow-sm hover:border-primary/40 transition-colors">
              <CardContent className="p-4 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</h4>
                      {item.isPopular && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-100 text-amber-800">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                    <div className="mt-2 text-[11px] font-mono text-slate-400">
                      Code: {item.code}
                    </div>
                  </div>
                </div>

                <Switch
                  checked={item.active}
                  onCheckedChange={() => toggleAmenity(item.id)}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

