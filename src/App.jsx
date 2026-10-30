import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './components/layout/admin-layout';
import { ProtectedRoute, AuthRedirect } from './components/auth/protected-route';
import { PermissionGuard, HomeRedirect } from './components/auth/permission-guard';
import { Toaster } from './components/ui/toaster';

// Auth
import { Login } from './pages/auth/login';

// Pages
import { Dashboard } from './pages/dashboard/index';
import { UsersPage } from './pages/users/index';
import { UserProfilePage } from './pages/users/profile';
import { DriversPage } from './pages/drivers/index';
import { DriverProfilePage } from './pages/drivers/profile';
import { VendorsPage } from './pages/vendors/index';
import { RapidBookingsPage } from './pages/rapid-bookings/index';
import { BusBookingsPage } from './pages/bus-bookings/index';
import { VehicleListPage } from './pages/bike-auto/vehicles/index';
import { AddVehiclePage } from './pages/bike-auto/vehicles/add';
import { BikeAutoDriverListPage } from './pages/bike-auto/drivers/index';
import { AddBikeAutoDriverPage } from './pages/bike-auto/drivers/add';
import { ZoneListPage } from './pages/zone/index';
import { AddZonePage } from './pages/zone/add';
import { RolesPage } from './pages/roles/index';
import { StaffPage } from './pages/staff/index';
import { PaymentSettingsPage } from './pages/settings/payment-settings';
import { AppSettingsPage } from './pages/settings/index';
import { SupportPage } from './pages/support/index';
import { ReviewsPage } from './pages/reviews/index';
import { ReportsPage } from './pages/reports/index';
import { NotificationsPage } from './pages/notifications/index';
import { LiveTrackingPage } from './pages/live-tracking/index';
import { PlaceholderPage } from './components/ui/placeholder-page';
import { AmenitiesPage } from './pages/amenities/index';
import { TripSearchesPage } from './pages/trip-searches/index';
import { CarpoolPricingPage } from './pages/carpool/pricing/index';
import { CarpoolBookingsPage } from './pages/carpool/bookings/index';
import { CarpoolTripSearchesPage } from './pages/carpool/trip-searches/index';
import { CarpoolAmenitiesPage } from './pages/carpool/amenities/index';

function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={
            <AuthRedirect>
              <Login />
            </AuthRedirect>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<HomeRedirect />} />
          <Route path="dashboard" element={<PermissionGuard permission="dashboard"><Dashboard /></PermissionGuard>} />

          {/* People */}
          <Route path="users" element={<PermissionGuard permission="users"><UsersPage /></PermissionGuard>} />
          <Route path="users/profile/:id" element={<PermissionGuard permission="users"><UserProfilePage /></PermissionGuard>} />
          <Route path="users/:id" element={<PermissionGuard permission="users"><UserProfilePage /></PermissionGuard>} />
          <Route path="drivers" element={<PermissionGuard permission="drivers"><DriversPage /></PermissionGuard>} />
          <Route path="drivers/add" element={<PermissionGuard permission="drivers"><AddBikeAutoDriverPage key="drivers-add" /></PermissionGuard>} />
          <Route path="drivers/profile/:id" element={<PermissionGuard permission="drivers"><DriverProfilePage /></PermissionGuard>} />
          <Route path="drivers/:id" element={<PermissionGuard permission="drivers"><DriverProfilePage /></PermissionGuard>} />
          <Route path="drivers/edit/:id" element={<PermissionGuard permission="drivers"><AddBikeAutoDriverPage key="drivers-edit" /></PermissionGuard>} />
          <Route path="vendors" element={<PermissionGuard permission="vendors"><VendorsPage /></PermissionGuard>} />
          <Route path="kyc" element={<PermissionGuard permission="kyc"><PlaceholderPage title="KYC Verifications" description="Review and approve driver & vendor identity documents and background checks." /></PermissionGuard>} />

          {/* Bike Auto */}
          <Route path="bike-auto/vehicles" element={<PermissionGuard permission="vehicles"><VehicleListPage /></PermissionGuard>} />
          <Route path="bike-auto/vehicles/add" element={<PermissionGuard permission="vehicles"><AddVehiclePage key="bike-auto-vehicles-add" /></PermissionGuard>} />
          <Route path="bike-auto/vehicles/edit/:id" element={<PermissionGuard permission="vehicles"><AddVehiclePage key="bike-auto-vehicles-edit" /></PermissionGuard>} />
          <Route path="bike-auto/drivers" element={<Navigate to="/drivers" replace />} />
          <Route path="bike-auto/drivers/add" element={<PermissionGuard permission="drivers"><AddBikeAutoDriverPage key="bike-auto-drivers-add" /></PermissionGuard>} />
          <Route path="bike-auto/drivers/edit/:id" element={<PermissionGuard permission="drivers"><AddBikeAutoDriverPage key="bike-auto-drivers-edit" /></PermissionGuard>} />
          <Route path="amenities" element={<PermissionGuard permission="vehicles"><AmenitiesPage /></PermissionGuard>} />

          {/* Zone Management */}
          <Route path="zone" element={<Navigate to="/zone/list" replace />} />
          <Route path="zone/list" element={<PermissionGuard permission="zone"><ZoneListPage /></PermissionGuard>} />
          <Route path="zone/add" element={<PermissionGuard permission="zone"><AddZonePage /></PermissionGuard>} />
          <Route path="zones" element={<Navigate to="/zone/list" replace />} />

          {/* Car Pool Rides */}
          <Route path="carpool" element={<Navigate to="/carpool/pricing" replace />} />
          <Route path="carpool/pricing" element={<PermissionGuard permission="rapid-bookings"><CarpoolPricingPage /></PermissionGuard>} />
          <Route path="carpool/bookings" element={<PermissionGuard permission="rapid-bookings"><CarpoolBookingsPage /></PermissionGuard>} />
          <Route path="carpool/trip-searches" element={<PermissionGuard permission="rapid-bookings"><CarpoolTripSearchesPage /></PermissionGuard>} />
          <Route path="carpool/amenities" element={<PermissionGuard permission="rapid-bookings"><CarpoolAmenitiesPage /></PermissionGuard>} />

          {/* Rides */}
          <Route path="trip-searches" element={<PermissionGuard permission="rapid-bookings"><TripSearchesPage /></PermissionGuard>} />
          <Route path="rapid-bookings" element={<PermissionGuard permission="rapid-bookings"><RapidBookingsPage /></PermissionGuard>} />
          <Route path="bus-bookings/all" element={<PermissionGuard permission="bus-bookings"><BusBookingsPage /></PermissionGuard>} />
          <Route path="bus-bookings/providers" element={<PermissionGuard permission="bus-bookings"><BusBookingsPage /></PermissionGuard>} />
          <Route path="live-tracking" element={<PermissionGuard permission="live-tracking"><LiveTrackingPage /></PermissionGuard>} />

          {/* Finance */}
          <Route path="payment-settings" element={<PermissionGuard permission="payments"><PaymentSettingsPage /></PermissionGuard>} />
          <Route path="wallet-promo" element={<PermissionGuard permission="wallet-promo"><PlaceholderPage title="Wallet & Promotions" description="User wallet balances, cashback history and promotional campaigns." /></PermissionGuard>} />
          <Route path="coupons" element={<PermissionGuard permission="coupons"><PlaceholderPage title="Coupons" description="Create and manage discount coupons for users and rides." /></PermissionGuard>} />

          {/* Platform */}
          <Route path="notifications" element={<PermissionGuard permission="notifications"><NotificationsPage /></PermissionGuard>} />
          <Route path="support" element={<PermissionGuard permission="support"><SupportPage /></PermissionGuard>} />
          <Route path="reviews" element={<PermissionGuard permission="reviews"><ReviewsPage /></PermissionGuard>} />
          <Route path="reports" element={<PermissionGuard permission="reports"><ReportsPage /></PermissionGuard>} />

          {/* Analytics */}
          <Route path="analytics" element={<PermissionGuard permission="analytics"><PlaceholderPage title="Analytics" description="Deep analytics on ride volumes, revenue, driver performance, and city-level heat maps." /></PermissionGuard>} />
          <Route path="logs" element={<PermissionGuard permission="logs"><PlaceholderPage title="System Logs" description="API logs, webhook events, and system audit trails." /></PermissionGuard>} />

          {/* Admin */}
          <Route path="roles" element={<PermissionGuard permission="roles"><RolesPage /></PermissionGuard>} />
          <Route path="staff" element={<PermissionGuard permission="staff"><StaffPage /></PermissionGuard>} />
          <Route path="settings" element={<PermissionGuard permission="settings"><AppSettingsPage /></PermissionGuard>} />
          <Route path="settings/payments" element={<PermissionGuard permission="settings"><PaymentSettingsPage /></PermissionGuard>} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
