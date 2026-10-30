import { create } from 'zustand';

const initialReports = [
  {
    id: 'REP-7001',
    reportNumber: '#REP-7001',
    incidentType: 'SOS Emergency Alert',
    severity: 'Critical',
    status: 'Under Investigation',
    createdAt: '2026-10-20T13:10:00Z',
    rideId: 'MAAT-RD-98230',
    serviceType: 'Cab',
    reporterType: 'Rider',
    reporterName: 'Megha Singhania',
    reporterPhone: '+91 98111 22334',
    reporterAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    targetType: 'Driver',
    targetName: 'Satish Goud',
    targetPhone: '+91 97000 88776',
    targetVehicle: 'TS 09 EA 4192 (White Swift Dzire)',
    pickup: 'Financial District, WaveRock SEZ',
    drop: 'Banjara Hills Road No. 2',
    currentLocation: 'Outer Ring Road Exit 19, Nanakramguda',
    description: 'In-app SOS panic button triggered by rider. Ride deviated 4.2 km from mapped route towards dark service road. Live audio snippet flagged raised voices.',
    evidenceUrls: [
      'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400',
    ],
    adminNotes: 'Control Room contacted rider at 13:12. Patrol vehicle MAAT-PCR-04 dispatched to ORR Junction. Driver claims taking shortcut due to road construction.',
    actionTaken: 'Driver Temporarily Suspended Pending Investigation',
  },
  {
    id: 'REP-7002',
    reportNumber: '#REP-7002',
    incidentType: 'Fare Extortion & Threats',
    severity: 'High',
    status: 'Pending',
    createdAt: '2026-10-20T11:45:00Z',
    rideId: 'MAAT-RD-98212',
    serviceType: 'Auto',
    reporterType: 'Rider',
    reporterName: 'Aditya Kashyap',
    reporterPhone: '+91 99890 55443',
    reporterAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    targetType: 'Driver',
    targetName: 'Narsimha Reddy',
    targetPhone: '+91 98490 66554',
    targetVehicle: 'TS 09 UB 5510 (Bajaj Auto)',
    pickup: 'Secunderabad Railway Station',
    drop: 'Ameerpet Metro Station',
    currentLocation: 'Ameerpet Crossroads',
    description: 'Driver demanded ₹150 extra cash above digital booking fare of ₹160. When refused, driver blocked rider from taking luggage out of the auto.',
    evidenceUrls: [],
    adminNotes: 'Awaiting tele-interview with station master and driver supervisor.',
    actionTaken: null,
  },
  {
    id: 'REP-7003',
    reportNumber: '#REP-7003',
    incidentType: 'Customer Physical Damage to Auto',
    severity: 'Medium',
    status: 'Under Investigation',
    createdAt: '2026-10-19T22:30:00Z',
    rideId: 'MAAT-RD-98019',
    serviceType: 'Auto',
    reporterType: 'Driver',
    reporterName: 'K. Balakrishna (Driver)',
    reporterPhone: '+91 97010 33221',
    reporterAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    targetType: 'Rider',
    targetName: 'Rohit Khanna (Customer)',
    targetPhone: '+91 99000 11998',
    targetVehicle: 'TS 08 UB 7721 (Auto)',
    pickup: 'Gachibowli Stadium Road',
    drop: 'Kondapur Main Road',
    currentLocation: 'Kondapur RTO',
    description: 'Intoxicated passenger kicked the side mirror of auto upon argument over drop gate and shattered the side panel glass.',
    evidenceUrls: [
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400',
    ],
    adminNotes: 'Driver submitted photo evidence of broken mirror. Damage estimated at ₹950. Reached out to customer for recovery fee.',
    actionTaken: 'Customer Wallet Placed on Hold for ₹950',
  },
  {
    id: 'REP-7004',
    reportNumber: '#REP-7004',
    incidentType: 'Dangerous & Rash Highway Driving',
    severity: 'High',
    status: 'Resolved',
    createdAt: '2026-10-19T16:15:00Z',
    rideId: 'MAAT-RD-97902',
    serviceType: 'Bike',
    reporterType: 'Rider',
    reporterName: 'Swathi Pillai',
    reporterPhone: '+91 96520 44112',
    reporterAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    targetType: 'Driver',
    targetName: 'Venkat Ramana',
    targetPhone: '+91 99880 77441',
    targetVehicle: 'TS 07 ED 1102 (Hero Splendor)',
    pickup: 'Madhapur Mindspace Circle',
    drop: 'Kukatpally Housing Board',
    currentLocation: 'JNTU Flyover',
    description: 'Driver clocked 85 km/h on wet road in 50 km/h zone, overtook heavy trucks from blind left side. Ignored rider requests to slow down.',
    evidenceUrls: [],
    adminNotes: 'Telematics speed log confirms speed breach of 84.6 km/h. Driver summoned to Kukatpally hub for 2-day mandatory defensive driving retraining.',
    actionTaken: 'Driver Fined ₹500 & Mandated Safety Workshop',
  },
  {
    id: 'REP-7005',
    reportNumber: '#REP-7005',
    incidentType: 'Suspected Ride Tampering / Offline Negotiation',
    severity: 'Low',
    status: 'Dismissed',
    createdAt: '2026-10-18T14:00:00Z',
    rideId: 'MAAT-RD-97740',
    serviceType: 'Cab',
    reporterType: 'Rider',
    reporterName: 'Anand Joshi',
    reporterPhone: '+91 95020 99881',
    reporterAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    targetType: 'Driver',
    targetName: 'T. Shekhar',
    targetPhone: '+91 94410 88229',
    targetVehicle: 'TS 09 EA 3391 (Cab)',
    pickup: 'Begumpet Airport Road',
    drop: 'Somajiguda',
    currentLocation: 'Somajiguda Circle',
    description: 'Passenger reported driver asked if they would like to cancel app ride and pay ₹50 less cash directly.',
    evidenceUrls: [],
    adminNotes: 'Driver denies allegation. Ride was completed online with full digital OTP and receipt. No prior complaints against driver. Issue closed with reminder on platform policies.',
    actionTaken: 'Policy Advisory Sent to Driver',
  },
];

const STORAGE_KEY = 'maat_safety_reports_v1';

const loadReports = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse safety reports:', e);
  }
  return initialReports;
};

export const useReportStore = create((set, get) => ({
  reports: loadReports(),

  addReport: (reportData) => {
    const id = `REP-${Math.floor(7000 + Math.random() * 2000)}`;
    const newReport = {
      id,
      reportNumber: `#${id}`,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      evidenceUrls: [],
      ...reportData,
    };
    const updated = [newReport, ...get().reports];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ reports: updated });
    return newReport;
  },

  updateReportStatus: (id, status) => {
    const updated = get().reports.map((r) =>
      r.id === id ? { ...r, status } : r
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ reports: updated });
  },

  updateAdminNotes: (id, adminNotes, actionTaken) => {
    const updated = get().reports.map((r) =>
      r.id === id
        ? {
            ...r,
            adminNotes,
            ...(actionTaken !== undefined ? { actionTaken } : {}),
          }
        : r
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ reports: updated });
  },

  deleteReport: (id) => {
    const updated = get().reports.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ reports: updated });
  },

  resetDefaults: () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialReports));
    set({ reports: initialReports });
  },
}));
