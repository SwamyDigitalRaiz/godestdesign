import { create } from 'zustand';

const initialNotifications = [
  {
    id: 'NOTIF-501',
    title: '🌧️ Rain Surge Alert: 1.5x Earnings Active in Hitec City!',
    body: 'High passenger ride demand detected near Cyber Towers & Mindspace. Go online now to earn guaranteed peak incentives on all Auto and Bike trips.',
    target: 'drivers',
    targetLabel: 'All Active Drivers (Auto & Bike)',
    targetZone: 'Hitec City IT Corridor',
    type: 'Surge Alert',
    channel: 'Push + SMS',
    status: 'Sent',
    sentAt: '2026-10-20T14:15:00Z',
    deliveredCount: 4280,
    openCount: 2940,
    openRate: '68.7%',
    sentBy: 'Super Admin',
    deepLink: 'maat://driver/incentives',
  },
  {
    id: 'NOTIF-502',
    title: '🎉 50% OFF Your Next 3 Auto Rides with code GODEST50',
    body: 'Commute hassle-free across Hyderabad! Enjoy flat 50% discount up to ₹60 on all Auto bookings till Sunday midnight.',
    target: 'riders',
    targetLabel: 'All Passengers (Hyderabad)',
    targetZone: 'All Zones',
    type: 'Promotion',
    channel: 'Push Notification',
    status: 'Sent',
    sentAt: '2026-10-19T18:00:00Z',
    deliveredCount: 38500,
    openCount: 14220,
    openRate: '36.9%',
    sentBy: 'Marketing Team',
    deepLink: 'maat://passenger/coupons',
  },
  {
    id: 'NOTIF-503',
    title: '⚠️ Safety Advisory: Mandatory Passenger Helmet Verification',
    body: 'Dear Bike Captains, Hyderabad Traffic Police is conducting strict helmet checks. Ensure your secondary passenger helmet is clean and strapped before starting the ride.',
    target: 'bike_drivers',
    targetLabel: 'Bike Captains Only',
    targetZone: 'All Zones',
    type: 'Safety & Compliance',
    channel: 'In-App Alert',
    status: 'Sent',
    sentAt: '2026-10-18T09:30:00Z',
    deliveredCount: 6120,
    openCount: 5200,
    openRate: '84.9%',
    sentBy: 'Safety Command Center',
    deepLink: 'maat://driver/safety-guidelines',
  },
  {
    id: 'NOTIF-504',
    title: '📄 Immediate Action: Vehicle Insurance Renewal Due',
    body: 'Your commercial auto insurance expires in 5 days. Please upload renewed policy documents to avoid temporary automatic dispatch suspension.',
    target: 'specific_driver',
    targetLabel: 'Expiring KYC Drivers (48 Partners)',
    targetZone: 'Secunderabad Zone',
    type: 'Document Reminder',
    channel: 'Push + WhatsApp',
    status: 'Sent',
    sentAt: '2026-10-17T11:00:00Z',
    deliveredCount: 48,
    openCount: 45,
    openRate: '93.7%',
    sentBy: 'Vendor Onboarding Desk',
    deepLink: 'maat://driver/documents',
  },
];

const STORAGE_KEY = 'maat_notifications_v1';

const loadNotifications = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse notifications from storage:', e);
  }
  return initialNotifications;
};

export const useNotificationStore = create((set, get) => ({
  notifications: loadNotifications(),

  sendNotification: (data) => {
    const id = `NOTIF-${Math.floor(500 + Math.random() * 500)}`;
    const newNotif = {
      id,
      status: 'Sent',
      sentAt: new Date().toISOString(),
      deliveredCount: data.estimatedReach || Math.floor(1200 + Math.random() * 8000),
      openCount: 0,
      openRate: '0.0%',
      sentBy: 'Super Admin',
      ...data,
    };
    const updated = [newNotif, ...get().notifications];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ notifications: updated });
    return newNotif;
  },

  deleteNotification: (id) => {
    const updated = get().notifications.filter((n) => n.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ notifications: updated });
  },

  resetDefaults: () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialNotifications));
    set({ notifications: initialNotifications });
  },
}));
