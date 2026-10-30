import { create } from 'zustand';

const initialTickets = [
  {
    id: 'TCK-8801',
    ticketNumber: '#TCK-8801',
    userType: 'Rider',
    userName: 'Kavitha Reddy',
    userPhone: '+91 98490 12345',
    userEmail: 'kavitha.r@gmail.com',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    subject: 'Driver demanded extra cash over meter fare',
    category: 'Fare Dispute',
    priority: 'High',
    status: 'Open',
    rideId: 'MAAT-RD-98201',
    vehicleNumber: 'TS 09 UA 8841 (Auto)',
    driverName: 'Suresh Kumar',
    pickup: 'Hitec City Metro Station, Hyderabad',
    drop: 'Kondapur RTO Office, Hyderabad',
    fareAmount: 185,
    createdAt: '2026-10-20T11:30:00Z',
    assignedTo: 'Ananya Sharma',
    messages: [
      {
        id: 'msg-01',
        sender: 'user',
        senderName: 'Kavitha Reddy',
        text: 'The auto driver Suresh Kumar refused to accept digital payment at the end of the trip and forcibly demanded an extra ₹50 cash citing traffic delay.',
        timestamp: '2026-10-20T11:30:00Z',
      },
    ],
  },
  {
    id: 'TCK-8802',
    ticketNumber: '#TCK-8802',
    userType: 'Rider',
    userName: 'Vikram Malhotra',
    userPhone: '+91 97110 54321',
    userEmail: 'vikram.m@outlook.com',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    subject: 'Left laptop bag in bike courier delivery box',
    category: 'Lost & Found',
    priority: 'Urgent',
    status: 'In Progress',
    rideId: 'MAAT-RD-98188',
    vehicleNumber: 'TS 07 ED 9920 (Bike)',
    driverName: 'Ramesh Patel',
    pickup: 'Gachibowli DLF Cybercity',
    drop: 'Madhapur Metro Station',
    fareAmount: 95,
    createdAt: '2026-10-20T09:45:00Z',
    assignedTo: 'Rajesh Varma',
    messages: [
      {
        id: 'msg-01',
        sender: 'user',
        senderName: 'Vikram Malhotra',
        text: 'I forgot my grey Dell laptop bag in the helmet basket/courier pouch after getting down at Madhapur. Please help connect with driver immediately!',
        timestamp: '2026-10-20T09:45:00Z',
      },
      {
        id: 'msg-02',
        sender: 'agent',
        senderName: 'Rajesh Varma (Support Agent)',
        text: 'Hello Vikram, we have contacted driver Ramesh Patel. He confirmed your bag is secure with him. He will deposit it at the Gachibowli MAAT Hub by 3:00 PM.',
        timestamp: '2026-10-20T10:15:00Z',
      },
    ],
  },
  {
    id: 'TCK-8803',
    ticketNumber: '#TCK-8803',
    userType: 'Driver',
    userName: 'Mohammed Arif',
    userPhone: '+91 98855 67890',
    userEmail: 'arif.driver@gmail.com',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    subject: 'Fare payment deduction issue for ride MAAT-RD-97940',
    category: 'Payment & Wallet',
    priority: 'Medium',
    status: 'In Progress',
    rideId: 'MAAT-RD-97940',
    vehicleNumber: 'TS 08 UB 4512 (Auto)',
    driverName: 'Mohammed Arif',
    pickup: 'Secunderabad Railway Station',
    drop: 'Banjara Hills Road No. 12',
    fareAmount: 240,
    createdAt: '2026-10-19T18:10:00Z',
    assignedTo: 'Ananya Sharma',
    messages: [
      {
        id: 'msg-01',
        sender: 'user',
        senderName: 'Mohammed Arif (Driver Partner)',
        text: 'The passenger paid ₹240 via QR, but my driver earnings wallet only credited ₹190 instead of ₹216 (90% commission split). Please recalculate platform incentive.',
        timestamp: '2026-10-19T18:10:00Z',
      },
      {
        id: 'msg-02',
        sender: 'agent',
        senderName: 'Ananya Sharma (Support Agent)',
        text: 'Hi Arif, reviewing the commission breakdown for ride #97940. There was a temporary TDS deduction adjustment. Verifying with accounts team.',
        timestamp: '2026-10-19T19:00:00Z',
      },
    ],
  },
  {
    id: 'TCK-8804',
    ticketNumber: '#TCK-8804',
    userType: 'Rider',
    userName: 'Sneha Chawla',
    userPhone: '+91 99001 23456',
    userEmail: 'sneha.c@gmail.com',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    subject: 'Ride cancelled by driver after 15 min waiting fee charged',
    category: 'Cancellation & Refund',
    priority: 'Medium',
    status: 'Resolved',
    rideId: 'MAAT-RD-97812',
    vehicleNumber: 'TS 10 EA 3301 (Cab)',
    driverName: 'K. Prasad',
    pickup: 'Jubilee Hills Check Post',
    drop: 'Shamshabad Airport Terminal 1',
    fareAmount: 45,
    createdAt: '2026-10-19T14:20:00Z',
    assignedTo: 'Rajesh Varma',
    messages: [
      {
        id: 'msg-01',
        sender: 'user',
        senderName: 'Sneha Chawla',
        text: 'The cab driver did not arrive at the pin location and cancelled after 15 minutes. A ₹45 cancellation fee was wrongfully deducted from my wallet.',
        timestamp: '2026-10-19T14:20:00Z',
      },
      {
        id: 'msg-02',
        sender: 'agent',
        senderName: 'Rajesh Varma (Support Agent)',
        text: 'Apologies for the hassle Sneha. GPS logs confirm the driver was 800m away. We have refunded ₹45 back to your MAAT Mobility Wallet + added ₹50 ride voucher.',
        timestamp: '2026-10-19T14:45:00Z',
      },
    ],
  },
  {
    id: 'TCK-8805',
    ticketNumber: '#TCK-8805',
    userType: 'Rider',
    userName: 'Arjun Das',
    userPhone: '+91 96543 21098',
    userEmail: 'arjun.das@techcorp.in',
    userAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    subject: 'App payment crashed during UPI payment redirect',
    category: 'Technical & App',
    priority: 'Low',
    status: 'Closed',
    rideId: 'MAAT-RD-97645',
    vehicleNumber: 'TS 09 UA 1190 (Bike)',
    driverName: 'Santosh Rao',
    pickup: 'Inorbit Mall Cyberabad',
    drop: 'Ayyappa Society',
    fareAmount: 65,
    createdAt: '2026-10-18T16:00:00Z',
    assignedTo: 'Pooja Hegde',
    messages: [
      {
        id: 'msg-01',
        sender: 'user',
        senderName: 'Arjun Das',
        text: 'GPay crashed upon redirect. Amount was debited twice from bank.',
        timestamp: '2026-10-18T16:00:00Z',
      },
      {
        id: 'msg-02',
        sender: 'agent',
        senderName: 'Pooja Hegde (Tech Support)',
        text: 'Duplicate transaction reversed automatically by Cashfree Gateway with ARN: 994829104. Funds credited within 24 hours.',
        timestamp: '2026-10-18T17:30:00Z',
      },
    ],
  },
];

const STORAGE_KEY = 'maat_support_tickets_v1';

const loadTickets = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse support tickets:', e);
  }
  return initialTickets;
};

export const useSupportStore = create((set, get) => ({
  tickets: loadTickets(),

  addTicket: (ticketData) => {
    const id = `TCK-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket = {
      id,
      ticketNumber: `#${id}`,
      status: 'Open',
      createdAt: new Date().toISOString(),
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'user',
          senderName: ticketData.userName,
          text: ticketData.description || ticketData.subject,
          timestamp: new Date().toISOString(),
        },
      ],
      ...ticketData,
    };
    const updated = [newTicket, ...get().tickets];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ tickets: updated });
    return newTicket;
  },

  updateTicketStatus: (id, newStatus) => {
    const updated = get().tickets.map((t) =>
      t.id === id ? { ...t, status: newStatus } : t
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ tickets: updated });
  },

  updateTicketPriority: (id, newPriority) => {
    const updated = get().tickets.map((t) =>
      t.id === id ? { ...t, priority: newPriority } : t
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ tickets: updated });
  },

  addReply: (id, text, agentName = 'Super Admin') => {
    const updated = get().tickets.map((t) => {
      if (t.id !== id) return t;
      const newMsg = {
        id: `msg-${Date.now()}`,
        sender: 'agent',
        senderName: agentName,
        text,
        timestamp: new Date().toISOString(),
      };
      return {
        ...t,
        status: t.status === 'Open' ? 'In Progress' : t.status,
        messages: [...t.messages, newMsg],
      };
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ tickets: updated });
  },

  deleteTicket: (id) => {
    const updated = get().tickets.filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ tickets: updated });
  },

  resetDefaults: () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialTickets));
    set({ tickets: initialTickets });
  },
}));
