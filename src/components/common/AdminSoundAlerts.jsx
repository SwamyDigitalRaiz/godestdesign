import { useEffect } from 'react';
import { getAdminSocket } from '../../services/socketService';
import { announceEvent, cleanNameForSpeech } from '../../services/soundService';
import { useToast } from '../ui/toaster';

export function AdminSoundAlerts() {
  const { toast } = useToast();

  useEffect(() => {
    const socket = getAdminSocket();
    if (!socket) return;

    // Deduplication set to prevent duplicate triggers
    const processedKeys = new Set();
    const isDuplicate = (key) => {
      if (!key) return false;
      if (processedKeys.has(key)) return true;
      processedKeys.add(key);
      setTimeout(() => processedKeys.delete(key), 4000);
      return false;
    };

    // ── 1. Passenger (User) Registration ─────────────────────────────────────
    const handleUserRegistered = (data) => {
      const id = data?.userId || data?.id || data?.phone;
      if (isDuplicate(`user-reg-${id}`)) return;

      const name = cleanNameForSpeech(data?.name || 'New Passenger');
      announceEvent('registration', `New passenger registered: ${name}.`);
      toast({
        title: 'New Passenger Registered!',
        description: `${data?.name || 'A new rider'} just signed up for Go Dest.`,
      });
    };

    // ── 2. Driver (Captain) Registration ─────────────────────────────────────
    const handleDriverRegistered = (data) => {
      const id = data?.driverId || data?.id || data?.customId || data?.phone;
      if (isDuplicate(`driver-reg-${id}`)) return;

      const name = cleanNameForSpeech(data?.name || 'New Driver');
      announceEvent('registration', `New driver registered: ${name}.`);
      toast({
        title: 'New Driver Registration!',
        description: `${data?.name || 'A driver'} applied for captain onboarding (${data?.vehicleType || 'Fleet'}).`,
      });
    };

    // ── 3. Fleet Operator Registration ─────────────────────────────────────────
    const handleFleetRegistered = (data) => {
      const id = data?.id || data?.name || data?.email;
      if (isDuplicate(`fleet-reg-${id}`)) return;

      const name = cleanNameForSpeech(data?.name || 'New Fleet Operator');
      announceEvent('registration', `New fleet operator registered: ${name}.`);
      toast({
        title: 'New Fleet Operator Registered!',
        description: `${data?.name || 'Fleet Operator'} joined the Go Dest platform.`,
      });
    };

    // ── 4. Any User Book Anything (New Booking Created) ───────────────────────
    const handleRideBooking = (data) => {
      const id = data?.rideId || data?.customId || data?._id;
      if (isDuplicate(`booking-${id}`)) return;

      const passenger = cleanNameForSpeech(data?.passengerName || 'Passenger');
      const vehicle = data?.vehicleType || 'Ride';
      announceEvent('booking', `New booking received from ${passenger}. ${vehicle} requested.`);
      toast({
        title: 'New Ride Booking!',
        description: `${data?.passengerName || 'A passenger'} booked a ${vehicle} (${data?.fare ? `₹${data.fare}` : 'Live'}).`,
      });
    };

    // Subscribe ONLY to registration and booking events
    socket.on('admin:user:registered', handleUserRegistered);
    socket.on('new-user-registered', handleUserRegistered);
    socket.on('admin:driver:registered', handleDriverRegistered);
    socket.on('admin:fleet:registered', handleFleetRegistered);
    socket.on('admin:ride:new', handleRideBooking);
    socket.on('ride:new', handleRideBooking);
    socket.on('booking:new', handleRideBooking);
    socket.on('admin:booking:new', handleRideBooking);

    return () => {
      socket.off('admin:user:registered', handleUserRegistered);
      socket.off('new-user-registered', handleUserRegistered);
      socket.off('admin:driver:registered', handleDriverRegistered);
      socket.off('admin:fleet:registered', handleFleetRegistered);
      socket.off('admin:ride:new', handleRideBooking);
      socket.off('ride:new', handleRideBooking);
      socket.off('booking:new', handleRideBooking);
      socket.off('admin:booking:new', handleRideBooking);
    };
  }, [toast]);

  return null;
}

