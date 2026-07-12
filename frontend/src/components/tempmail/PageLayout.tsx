import { type ReactNode } from "react";

import { Footer } from "@/components/tempmail/Footer";
import { Header } from "@/components/tempmail/Header";

type PageLayoutProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function PageLayout({
  children,
  className = "",
  contentClassName = "max-w-4xl",
}: PageLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className={`mx-auto w-full flex-1 px-4 py-10 ${contentClassName} ${className}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
