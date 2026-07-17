import { Navigate, Route, Routes } from "react-router-dom";

import { AdminLayout } from "@/layouts/AdminLayout";
import { ProtectedAdminRoute } from "@/layouts/ProtectedAdminRoute";
import {
  AdminAbusePage,
  AdminDomainsPage,
  AdminLoginPage,
  AdminMailboxesPage,
  AdminOperationsPage,
  AdminSettingsPage,
  ContactPage,
  DomainsPage,
  DonatePage,
  FaqPage,
  Home,
  NotFoundPage,
  PrivacyPage,
  TermsPage,
} from "@/routes/lazy-pages";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/faq" element={<FaqPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/donate" element={<DonatePage />} />
      <Route path="/domains" element={<DomainsPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }
      >
        <Route index element={<Navigate to="/admin/domains" replace />} />
        <Route path="domains" element={<AdminDomainsPage />} />
        <Route path="mailboxes" element={<AdminMailboxesPage />} />
        <Route path="abuse" element={<AdminAbusePage />} />
        <Route path="operations" element={<AdminOperationsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
