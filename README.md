# Go Dest - Super Admin Demo (Client Preview)

A standalone, 100% static client demonstration build of the **Go Dest Super Admin Panel**.

### ✨ Highlights & Architecture
- **Zero Backend Dependency**: Fully decoupled from backend APIs, databases, and live WebSocket servers.
- **Pre-populated Mock Database**: Includes rich, realistic mock datasets for:
  - 🚗 **Carpool Sharing**: Pricing matrix, Carpool Bookings, Live Route Tracking, Stopovers, Passenger Trip Searches, and Amenities.
  - 🛺 **Bike & Auto Mobility**: Rapid Bookings dispatch, Active Drivers, Live GPS Fleet Tracking, and Pricing.
  - 🚌 **Bus Ticket Integration**: RedBus, AbhiBus, and Bitla API mock feeds with PNR booking details.
  - 👥 **Users & Drivers**: Profiles, ratings, verification badges, trip history, and wallet balances.
  - 🗺️ **Zones & Geofencing**: City polygons, surge pricing multipliers, and coverage analytics.
  - 🏢 **Fleet Vendors & Staff**: Multi-tier RBAC, staff permissions, and commission tracking.
  - 🛡️ **Safety & Support**: Incident reports, SOS alerts, passenger tickets, and review moderation.
- **Seamless Local Persistence**: Edits made in the UI (e.g. creating/editing zones, changing commission, updating settings, toggling driver statuses) automatically save to `localStorage`.
- **Instant Access**: Bypasses login roadblocks with super administrator permissions pre-granted.

---

### 🚀 Running Locally

```bash
# 1. Navigate to admin-demo
cd godest/admin-demo

# 2. Start the Vite development server (runs on port 5174)
npm run dev

# 3. Open your browser
http://localhost:5174
```

---

### 🌐 Deploying & Sharing with Client

Because this demo is 100% static, it can be deployed to any static host in seconds:

#### Option A: Vercel
```bash
cd godest/admin-demo
npx vercel
```

#### Option B: Netlify
```bash
cd godest/admin-demo
npm run build
npx netlify deploy --dir=dist --prod
```

#### Option C: Local Tunnel (ngrok / Cloudflare Tunnel)
```bash
# Start Vite
npm run dev

# In another terminal, share the local port with client:
npx untun@latest tunnel http://localhost:5174
# OR
npx cloudflared tunnel --url http://localhost:5174
```
