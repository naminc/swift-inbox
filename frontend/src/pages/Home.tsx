import { useMemo, useState } from "react";

import { EmailCreator } from "@/components/tempmail/EmailCreator";
import { EmailViewer } from "@/components/tempmail/EmailViewer";
import { Footer } from "@/components/tempmail/Footer";
import { Header } from "@/components/tempmail/Header";
import { InboxList } from "@/components/tempmail/InboxList";
import { Toolbar } from "@/components/tempmail/Toolbar";
import { usePageTitle } from "@/hooks/use-page-title";
import { DOMAINS, MOCK_EMAILS, type MockEmail } from "@/lib/mock-data";

const randomName = () => {
  const words = [
    "swift",
    "quiet",
    "misty",
    "lunar",
    "amber",
    "north",
    "cyan",
    "ember",
    "pixel",
    "orbit",
  ];
  const word = words[Math.floor(Math.random() * words.length)];
  const number = Math.floor(Math.random() * 900 + 100);
  return `${word}${number}`;
};

function normalizeUsername(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9._-]/g, "")
    .slice(0, 32);
}

function createInbox() {
  return MOCK_EMAILS.map((item, index) => ({
    ...item,
    unread: index === 0 ? false : item.unread,
  }));
}

export function Home() {
  usePageTitle("TempMail - Free Temporary Email");

  const [username, setUsername] = useState("naminc");
  const [domain, setDomain] = useState(DOMAINS[0]?.value ?? "");
  const [emails, setEmails] = useState<MockEmail[]>(() => createInbox());
  const [activeId, setActiveId] = useState<string | null>(MOCK_EMAILS[0]?.id ?? null);

  const email = useMemo(() => `${username || "inbox"}@${domain}`, [username, domain]);
  const active = emails.find((item) => item.id === activeId) ?? null;

  const resetInbox = () => {
    const next = createInbox();
    setEmails(next);
    setActiveId(next[0]?.id ?? null);
  };

  const generate = () => {
    setUsername(randomName());
    resetInbox();
  };

  const handleSelect = (id: string) => {
    setActiveId(id);
    setEmails((prev) => prev.map((item) => (item.id === id ? { ...item, unread: false } : item)));
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <EmailCreator
        username={username}
        domain={domain}
        onUsernameChange={(value) => setUsername(normalizeUsername(value))}
        onDomainChange={setDomain}
        onGenerate={generate}
      />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-10">
        <Toolbar
          email={email}
          onRandom={generate}
          onRefresh={resetInbox}
          onDelete={() => {
            setEmails([]);
            setActiveId(null);
          }}
        />

        <div className="mt-4 grid min-w-0 gap-4 overflow-hidden md:h-[560px] md:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
          <div className="h-[480px] min-h-0 min-w-0 overflow-hidden md:h-auto">
            <InboxList
              emails={emails}
              activeId={activeId}
              onSelect={handleSelect}
              onRefresh={resetInbox}
              onRandom={generate}
            />
          </div>
          <div className="min-h-0 min-w-0 overflow-hidden">
            <EmailViewer email={active} to={email} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
