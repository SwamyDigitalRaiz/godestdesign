export const DEFAULT_SETTINGS = {
  general: {
    appName: 'Go Dest Super App',
    legalEntity: 'Go Dest Technologies Pvt Ltd',
    supportEmail: 'support@godest.in',
    supportPhone: '+91 1800-425-6228',
    sosHelpline: '+91 40-2345-6789',
    headquarters: 'Floor 5, Skyview Towers, Hitec City, Hyderabad, 500081',
    currency: 'INR (₹)',
    timezone: 'Asia/Kolkata (IST)',
    maintenanceMode: false,
    maintenanceMessage: 'Go Dest systems are currently undergoing scheduled maintenance. Ride booking will resume shortly.',
    riderMinVersionAndroid: '2.4.1',
    riderMinVersionIos: '2.3.8',
    driverMinVersionAndroid: '3.1.0',
    driverMinVersionIos: '3.0.2',
    forceUpdateRiders: true,
    forceUpdateDrivers: true,
  },
  featureToggles: {
    bikeTaxi: true,
    autoRickshaw: true,
    rapidCabs: true,
    busBookings: true,
    nightSurgeEngine: true,
    sosPanicButton: true,
    aiDriverDispatch: true,
    cashToDriver: true,
    walletPayments: true,
    intercityRentals: false,
    electricVehiclePriority: true,
  },
  dispatchRules: {
    searchRadiusKm: 3.5,
    driverTimeoutSeconds: 20,
    maxDispatchDistanceKm: 5.0,
    freeCancellationMinutes: 3,
    cancellationPenaltyFee: 50,
    maxDriverDailyHours: 12,
    mandatoryRideOtp: true,
    autoOfflineOnConsecutiveMisses: true,
    speedingAlertThresholdKmph: 75,
  },
  locationSettings: {
    defaultCity: 'Hyderabad',
    defaultCenter: [17.4435, 78.3772], // [lat, lng]
    gpsUpdateIntervalSeconds: 3,
    locationAccuracyThresholdMeters: 15,
    highAccuracyMode: true,
    geofenceTrackingEnabled: true,
    maxNearbyDriverSearchRadiusKm: 4.0,
    serviceableCities: ['Hyderabad', 'Secunderabad', 'Vijayawada', 'Guntur', 'Visakhapatnam', 'Surat'],
    mapProvider: 'osm',
    googleMapsApiKey: '',
    enableReverseGeocodingCache: true,
  },
  inactivityPolicy: {
    isEnabled: true,
    warningMissedRides: 3,
    cooldownMinutes: 15,
    warningTitle: '⚠️ Inactivity & Low Acceptance Warning',
    warningMessage: 'You missed {count} consecutive ride pings while online. Please stay attentive. Missing {remaining} more will trigger a temporary 15-minute dispatch timeout.',
    suspensionThreshold: 6,
    suspensionTitle: '🚫 Shift Temporarily Paused',
    suspensionMessage: 'Your dispatch has been paused for 30 minutes due to 6 continuous unanswered ride requests. Take a rest and return online when ready.',
    minAcceptanceRatePercent: 75,
    maxCancellationRatePercent: 8,
    minDriverRatingThreshold: 4.2,
  },
  banners: [],
  introImages: [],
  policies: {
    user: {
      termsOfService: `GO DEST SUPER-APP PASSENGER TERMS OF SERVICE

1. ACCEPTANCE OF TERMS
By downloading, accessing, or using the Go Dest passenger application or web interface, you agree to be bound by these Terms of Service.

2. MOBILITY SERVICES PROVIDED
Go Dest acts as an aggregator connecting independent passenger riders with verified third-party driver partners for Bike Taxi, Auto-Rickshaw, City Cab, and Intercity Bus transport services.

3. PASSENGER FARES & TOLL FEES
Fares are calculated dynamically based on base fare, per-kilometer travel rate, duration minutes, and applicable government-mandated taxes or surge pricing.

4. SAFETY & ZERO-TOLERANCE CODE
Go Dest enforces a strict zero-tolerance policy towards harassment, physical altercation, verbal abuse, substance consumption, or reckless driving.

5. CANCELLATION CHARGES
Free cancellation is permitted up to 3 minutes after ride acceptance. Cancellations made thereafter or passenger no-show after 5 minutes incur standard cancellation fees.`,

      privacyPolicy: `GO DEST PASSENGER PRIVACY & TELEMATICS POLICY

1. INFORMATION WE COLLECT
- Precise GPS Geolocation: Real-time vehicle telematics for ride tracking, safety geofencing, and accurate navigation.
- Identification Data: Mobile telephone number, full name, email address, and emergency contact phone numbers.
- Transaction & Payment Data: Secure tokenized gateway identifiers for UPI, card, and digital wallet settlements.

2. PURPOSE OF DATA PROCESSING
Location data is processed exclusively to pair ride requests, broadcast live trip progression to emergency contacts, and enable SOS coordination.

3. DATA RETENTION & SECURITY
All telemetry and transaction logs are encrypted in transit via TLS 1.3 and at rest with AES-256 standards.`,

      refundDisputePolicy: `GO DEST PASSENGER FARE DISPUTE & REFUND RESOLUTION POLICY

1. ELIGIBLE DISPUTE SCENARIOS
- Driver Route Deviation: Significant detour taken without passenger consent leading to fare inflations.
- Double Deduction: Bank debited twice for a single trip or failed wallet top-up.
- Vehicle Breakdown: Driver unable to complete journey due to mechanical failure or puncture.

2. RESOLUTION TIMELINE
All fare adjustment grievances are audited against GPS waypoints and processed within 24 to 48 business hours.`,
    },
    driver: {
      termsOfService: `GO DEST DRIVER PARTNER TERMS OF SERVICE & CODE OF CONDUCT

1. PARTNER REGISTRATION & VEHICLE COMPLIANCE
All driver partners must possess a valid Commercial/Transport Driving License, vehicle registration certificate, active motor insurance, and vehicle fitness certificate.

2. DISPATCH & ACCEPTANCE RESPONSIBILITIES
Driver partners agree to fulfill trips accepted through the Go Dest Driver App and maintain high customer service standards.

3. SETTLEMENT & FARE REMITTANCE
Net earnings after platform aggregator fees are calculated weekly or on-demand and transferred directly to the verified bank account or UPI VPA.

4. SAFETY & VEHICLE STANDARDS
Drivers must maintain vehicular cleanliness, adhere strictly to regional speed limits, and observe zero-tolerance policies on intoxicated driving.`,

      privacyPolicy: `GO DEST DRIVER PARTNER TELEMATICS & LOCATION POLICY

1. CONTINUOUS FOREGROUND & BACKGROUND TELEMETRY
The Go Dest Driver App collects high-frequency GPS telematics while online to calculate travel distances, calculate dynamic fares, and pair nearby pickup requests.

2. VEHICLE SENSOR & GYROSCOPE TELEMETRY
Telemetry data monitors vehicle progression, speed alerts, and motion breadcrumbs to ensure driver and passenger safety.

3. EARNINGS & TAX IDENTIFICATION
PAN card, GST details (if registered), and Aadhaar details are audited strictly for income tax and motor transport compliance.`,

      refundDisputePolicy: `GO DEST DRIVER FARE ADJUSTMENT & TOLL REIMBURSEMENT POLICY

1. TOLL & PARKING CHARGES
Toll charges incurred during passenger trips are automatically audited against Fastag logs and added to the final trip invoice.

2. PASSENGER FARE DISPUTES
If a passenger disputes route distance, the dispute is audited against vehicle GPS breadcrumbs. Legitimate deductions or toll reimbursements are reviewed within 48 hours.`,
    },
    termsOfService: `GO DEST SUPER-APP TERMS OF SERVICE`,
    privacyPolicy: `GO DEST PLATFORM PRIVACY & TELEMATICS POLICY`,
    refundDisputePolicy: `GO DEST FARE DISPUTE & REFUND RESOLUTION POLICY`,
  },
};

export default DEFAULT_SETTINGS;

