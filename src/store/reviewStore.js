import { create } from 'zustand';

const initialReviews = [
  {
    id: 'REV-901',
    rideId: 'MAAT-RD-98204',
    serviceType: 'Auto',
    reviewerType: 'Rider',
    reviewerName: 'Priya Nambiar',
    reviewerPhone: '+91 98450 77123',
    reviewerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    driverName: 'Kishore Yadav',
    driverPhone: '+91 99880 11223',
    vehiclePlate: 'TS 09 UA 7102',
    rating: 5,
    comment: 'Super polite driver! Arrived right on time at Madhapur Metro and drove very safely through peak traffic. Accepted QR payment without any hesitation.',
    tags: ['Polite Driver', 'Clean Vehicle', 'On Time', 'Safe Driving'],
    status: 'Approved',
    featured: true,
    createdAt: '2026-10-20T12:15:00Z',
    likesCount: 14,
  },
  {
    id: 'REV-902',
    rideId: 'MAAT-RD-98190',
    serviceType: 'Bike',
    reviewerType: 'Rider',
    reviewerName: 'Sanjay Verma',
    reviewerPhone: '+91 98765 43210',
    reviewerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    driverName: 'Ravi Teja',
    driverPhone: '+91 97001 88990',
    vehiclePlate: 'TS 07 ED 4590',
    rating: 5,
    comment: 'Provided a clean sanitized passenger helmet and hair net. Navigated via quick bypass road. Best bike taxi ride in Hyderabad!',
    tags: ['Provided Helmet', 'Quick Route', 'Clean Helmet'],
    status: 'Approved',
    featured: true,
    createdAt: '2026-10-20T10:40:00Z',
    likesCount: 9,
  },
  {
    id: 'REV-903',
    rideId: 'MAAT-RD-98144',
    serviceType: 'Cab',
    reviewerType: 'Rider',
    reviewerName: 'Divya Sen',
    reviewerPhone: '+91 99123 45678',
    reviewerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    driverName: 'M. Anand',
    driverPhone: '+91 98480 33445',
    vehiclePlate: 'TS 10 EA 8832',
    rating: 2,
    comment: 'AC was not turned on despite booking Premium Cab. Driver argued that diesel rates are high and demanded ₹100 extra for switching on cooling.',
    tags: ['AC Not Working', 'Asked Extra Cash', 'Rude Behavior'],
    status: 'Flagged',
    featured: false,
    createdAt: '2026-10-19T20:10:00Z',
    likesCount: 2,
  },
  {
    id: 'REV-904',
    rideId: 'MAAT-RD-98075',
    serviceType: 'Auto',
    reviewerType: 'Rider',
    reviewerName: 'Karthik Rao',
    reviewerPhone: '+91 96180 99887',
    reviewerAvatar: 'https://images.unsplash.com/photo-1528892952291-009c663ce843?w=150',
    driverName: 'B. Shiva',
    driverPhone: '+91 94400 22110',
    vehiclePlate: 'TS 09 UB 1099',
    rating: 4,
    comment: 'Good ride overall. Auto was in decent condition. Slight delay of 5 minutes during pickup due to waterlogging near Jubilee Hills.',
    tags: ['Good Ride', 'Decent Auto'],
    status: 'Approved',
    featured: false,
    createdAt: '2026-10-19T17:30:00Z',
    likesCount: 4,
  },
  {
    id: 'REV-905',
    rideId: 'MAAT-RD-97990',
    serviceType: 'Cab',
    reviewerType: 'Rider',
    reviewerName: 'Anil Kumble',
    reviewerPhone: '+91 94900 11002',
    reviewerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    driverName: 'S. Naresh',
    driverPhone: '+91 98850 55443',
    vehiclePlate: 'TS 08 FA 7711',
    rating: 1,
    comment: 'Dangerous rash driving and continuous phone chatting during highway transit. Felt very unsafe throughout the journey.',
    tags: ['Rash Driving', 'Phone While Driving', 'Safety Issue'],
    status: 'Flagged',
    featured: false,
    createdAt: '2026-10-19T12:00:00Z',
    likesCount: 1,
  },
  {
    id: 'REV-906',
    rideId: 'MAAT-RD-97860',
    serviceType: 'Auto',
    reviewerType: 'Driver',
    reviewerName: 'Suresh Kumar (Driver)',
    reviewerPhone: '+91 98490 88776',
    reviewerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    driverName: 'Customer: Rohini Sen',
    driverPhone: '+91 97120 44332',
    vehiclePlate: 'TS 09 UA 8841',
    rating: 5,
    comment: 'Very polite customer, was ready at the pickup gate and paid exact fare online immediately upon trip end.',
    tags: ['Punctual Passenger', 'Instant Payment'],
    status: 'Approved',
    featured: false,
    createdAt: '2026-10-18T19:20:00Z',
    likesCount: 3,
  },
];

const STORAGE_KEY = 'maat_reviews_v1';

const loadReviews = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse reviews:', e);
  }
  return initialReviews;
};

export const useReviewStore = create((set, get) => ({
  reviews: loadReviews(),

  addReview: (reviewData) => {
    const newReview = {
      id: `REV-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      status: 'Approved',
      featured: false,
      likesCount: 0,
      ...reviewData,
    };
    const updated = [newReview, ...get().reviews];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ reviews: updated });
    return newReview;
  },

  updateReviewStatus: (id, status) => {
    const updated = get().reviews.map((r) =>
      r.id === id ? { ...r, status } : r
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ reviews: updated });
  },

  toggleFeatured: (id) => {
    const updated = get().reviews.map((r) =>
      r.id === id ? { ...r, featured: !r.featured } : r
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ reviews: updated });
  },

  deleteReview: (id) => {
    const updated = get().reviews.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ reviews: updated });
  },

  resetDefaults: () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialReviews));
    set({ reviews: initialReviews });
  },
}));
