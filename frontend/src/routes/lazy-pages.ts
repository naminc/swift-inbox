import { lazy } from "react";

export const AdminAbusePage = lazy(() =>
  import("@/pages/admin/AdminAbusePage").then((module) => ({
    default: module.AdminAbusePage,
  })),
);

export const AdminDomainsPage = lazy(() =>
  import("@/pages/admin/AdminDomainsPage").then((module) => ({
    default: module.AdminDomainsPage,
  })),
);

export const AdminLoginPage = lazy(() =>
  import("@/pages/admin/AdminLoginPage").then((module) => ({
    default: module.AdminLoginPage,
  })),
);

export const AdminMailboxesPage = lazy(() =>
  import("@/pages/admin/AdminMailboxesPage").then((module) => ({
    default: module.AdminMailboxesPage,
  })),
);

export const AdminOperationsPage = lazy(() =>
  import("@/pages/admin/AdminOperationsPage").then((module) => ({
    default: module.AdminOperationsPage,
  })),
);

export const AdminSettingsPage = lazy(() =>
  import("@/pages/admin/AdminSettingsPage").then((module) => ({
    default: module.AdminSettingsPage,
  })),
);

export const ContactPage = lazy(() =>
  import("@/pages/ContactPage").then((module) => ({ default: module.ContactPage })),
);

export const DomainsPage = lazy(() =>
  import("@/pages/DomainsPage").then((module) => ({ default: module.DomainsPage })),
);

export const DonatePage = lazy(() =>
  import("@/pages/DonatePage").then((module) => ({ default: module.DonatePage })),
);

export const FaqPage = lazy(() =>
  import("@/pages/FaqPage").then((module) => ({ default: module.FaqPage })),
);

export const Home = lazy(() => import("@/pages/Home").then((module) => ({ default: module.Home })));

export const NotFoundPage = lazy(() =>
  import("@/pages/NotFoundPage").then((module) => ({ default: module.NotFoundPage })),
);

export const PrivacyPage = lazy(() =>
  import("@/pages/PrivacyPage").then((module) => ({ default: module.PrivacyPage })),
);

export const TermsPage = lazy(() =>
  import("@/pages/TermsPage").then((module) => ({ default: module.TermsPage })),
);
