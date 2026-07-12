import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Routes } from "react-router-dom";

import { ContactPage } from "@/pages/ContactPage";
import { DomainsPage } from "@/pages/DomainsPage";
import { DonatePage } from "@/pages/DonatePage";
import { FaqPage } from "@/pages/FaqPage";
import { Home } from "@/pages/Home";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { PrivacyPage } from "@/pages/PrivacyPage";
import { TermsPage } from "@/pages/TermsPage";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/donate" element={<DonatePage />} />
        <Route path="/domains" element={<DomainsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </QueryClientProvider>
  );
}
