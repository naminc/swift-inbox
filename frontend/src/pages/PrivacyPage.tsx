import { PageLayout } from "@/components/tempmail/PageLayout";
import { usePageTitle } from "@/hooks/use-page-title";

const sections = [
  {
    title: "Temporary data",
    body: "Disposable addresses and inbox messages are temporary. Messages may be refreshed, removed, or become unavailable as domains and inbox sessions change.",
  },
  {
    title: "No account registration",
    body: "TempMail does not require you to create an account to use the inbox interface. Avoid sending sensitive or long-term account recovery information to temporary addresses.",
  },
  {
    title: "Clipboard and browser behavior",
    body: "Copy actions use your browser clipboard permission. Theme and interface preferences may be stored locally in your browser so the app feels consistent when you return.",
  },
  {
    title: "Third-party sites",
    body: "When you use a temporary address on another website, that website controls its own data practices. Review its terms before submitting any information.",
  },
  {
    title: "Contact and abuse",
    body: "If you need to report abuse, include the domain, address, timestamp, and a short description so the report can be reviewed more effectively.",
  },
];

export function PrivacyPage() {
  usePageTitle("Privacy - TempMail");

  return (
    <PageLayout>
      <div className="mx-auto w-full">
        <div className="border-b border-border pb-6">
          <p className="text-sm font-medium text-primary">Privacy</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">Privacy Policy</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            TempMail is designed for temporary inbox use. This page explains the practical privacy
            expectations for disposable email addresses.
          </p>
        </div>

        <div className="mt-8 space-y-7">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
