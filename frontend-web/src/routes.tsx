import { createBrowserRouter, Outlet } from 'react-router-dom';
import { lazy } from 'react';

import { PublicLayout } from '@/components/layout/PublicLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { RoleBasedRoute } from '@/components/layout/RoleBasedRoute';
import { RoleBasedRedirect } from '@/components/layout/RoleBasedRedirect';
import { ScrollToTop } from '@/components/layout/ScrollToTop';

const PublicDashboard = lazy(() => import('./app/page'));
const PublicMap = lazy(() => import('./app/PublicMap'));
const PublicReport = lazy(() => import('./app/PublicReport'));
const ResourcePage = lazy(() => import('./app/ResourcePage'));

const LoginPage = lazy(() => import('./features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('./features/auth/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./features/auth/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./features/auth/pages/ResetPasswordPage'));
const VerifyOtpPage = lazy(() => import('./features/auth/pages/VerifyOtpPage'));
const ShelterListPage = lazy(() => import('./features/shelters/pages/ShelterListPage'));
const ShelterDetailPage = lazy(() => import('./features/shelters/pages/ShelterDetailPage'));
const WarehouseListPage = lazy(() => import('./features/warehouses/pages/WarehouseListPage'));
const WarehouseDetailPage = lazy(() => import('./features/warehouses/pages/WarehouseDetailPage'));
const AssessmentWizardPage = lazy(() => import('./features/assessment/pages/AssessmentWizardPage'));
const NotificationsPage = lazy(() => import('./features/notifications/pages/NotificationsPage'));

const IncidentList = lazy(() => import('./app/incidents/page'));
const IncidentDetail = lazy(() => import('./app/incidents/[id]/page'));
const IncidentTimeline = lazy(() => import('./app/incidents/[id]/timeline/page'));
const NewIncident = lazy(() => import('./app/incidents/new/page'));
const Profile = lazy(() => import('./app/Profile'));
const Chat = lazy(() => import('./app/Chat'));
const CommandCenter = lazy(() => import('./app/CommandCenter'));
const Analytics = lazy(() => import('./app/analytics/page'));
const IntelPanel = lazy(() => import('./app/IntelPanel'));
const AuditLog = lazy(() => import('./app/AuditLog'));
const RelawanDashboard = lazy(() => import('./app/dashboard/relawan/page'));

const AdminICSPage = lazy(() => import('./app/AdminICS'));
const AdminAnalyticsPage = lazy(() => import('./app/AdminAnalytics'));
const AdminMessagesPage = lazy(() => import('./app/admin/MessagesPage'));
const AdminOrgChartPage = lazy(() => import('./app/admin/OrgChartPage'));

const FieldDashboardPage = lazy(() => import('./app/dashboard/field/page'));
const AdminDashboardPage = lazy(() => import('./app/dashboard/admin/page'));

function MapErrorFallback() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] gap-4 p-4">
      <div className="text-4xl">🗺️</div>
      <h2 className="text-xl font-bold text-slate-800">Peta tidak dapat dimuat</h2>
      <p className="text-slate-500 text-sm text-center">Terjadi kesalahan saat memuat peta. Silakan refresh halaman.</p>
      <a href="/map" className="text-nu-green hover:underline text-sm">Coba lagi</a>
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div className="text-6xl">404</div>
      <h1 className="text-2xl font-bold text-slate-800">Halaman Tidak Ditemukan</h1>
      <p className="text-slate-500">Halaman yang Anda cari tidak tersedia.</p>
      <a href="/" className="text-nu-green hover:underline text-sm">Kembali ke Beranda</a>
    </div>
  );
}

export const router = createBrowserRouter([
  // Scroll restoration wrapper
  {
    element: (
      <ScrollToTop>
        <Outlet />
      </ScrollToTop>
    ),
    children: [
      // Public routes
      {
        element: <PublicLayout />,
        children: [
          { path: '/', element: <PublicDashboard /> },
          { path: '/map', element: <PublicMap />, errorElement: <MapErrorFallback /> },
          { path: '/lapor', element: <PublicReport /> },
          { path: '/resource', element: <ResourcePage /> },
        ],
      },

      // Auth routes
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
          { path: '/forgot-password', element: <ForgotPasswordPage /> },
          { path: '/reset-password', element: <ResetPasswordPage /> },
          { path: '/verify-otp', element: <VerifyOtpPage /> },
        ],
      },

      // Protected routes (authenticated)
  {
    element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
    children: [
      { path: '/dashboard', element: <RoleBasedRedirect /> },
      { path: '/dashboard/field', element: <FieldDashboardPage /> },
      { path: '/dashboard/admin', element: <AdminDashboardPage /> },
      { path: '/dashboard/relawan', element: (
        <RoleBasedRoute allowedRoles={['volunteer']}>
          <RelawanDashboard />
        </RoleBasedRoute>
      )},
      { path: '/incidents', element: <IncidentList /> },
      { path: '/incidents/new', element: <NewIncident /> },
      { path: '/incidents/:id', element: <IncidentDetail /> },
      { path: '/incidents/:id/timeline', element: <IncidentTimeline /> },
      { path: '/profile', element: <Profile /> },
      { path: '/shelters', element: <ShelterListPage /> },
      { path: '/shelters/:id', element: <ShelterDetailPage /> },
      { path: '/warehouses', element: <WarehouseListPage /> },
      { path: '/warehouses/:id', element: <WarehouseDetailPage /> },
      { path: '/incidents/:id/assessment', element: <AssessmentWizardPage /> },
      { path: '/notifications', element: <NotificationsPage /> },
      { path: '/chat', element: <Chat /> },
      { path: '/command-center', element: <CommandCenter /> },
      { path: '/analytics', element: <Analytics /> },
      { path: '/intel', element: <IntelPanel /> },
      { path: '/audit-log', element: <AuditLog /> },
    ],
  },

  // Admin routes
  {
    element: (
      <ProtectedRoute>
        <RoleBasedRoute allowedRoles={['admin']}>
          <DashboardLayout />
        </RoleBasedRoute>
      </ProtectedRoute>
    ),
    children: [
      { path: '/admin', element: <AdminDashboardPage /> },
      { path: '/admin/ics', element: <AdminICSPage /> },
      { path: '/admin/analytics', element: <AdminAnalyticsPage /> },
      { path: '/admin/messages', element: <AdminMessagesPage /> },
      { path: '/admin/org-chart', element: <AdminOrgChartPage /> },
    ],
  },

  // 404
  { path: '*', element: <NotFound /> },
    ],
  },
]);

export default router;
