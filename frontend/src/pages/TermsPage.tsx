import { PageLayout } from "@/components/tempmail/PageLayout";
import { usePageTitle } from "@/hooks/use-page-title";

const sections = [
  {
    title: "Use of Service",
    body: "TempMail provides temporary inbox tools for convenience, testing, and privacy-minded browsing. Do not use the service for spam, fraud, abuse, harassment, or activity that violates applicable laws.",
  },
  {
    title: "Temporary Inbox Data",
    body: "Messages shown in the app are temporary and may be removed, refreshed, or become unavailable at any time. Do not rely on temporary addresses for important accounts, recovery emails, financial notices, or long-term records.",
  },
  {
    title: "No Sensitive Information",
    body: "Avoid receiving passwords, private documents, payment details, medical information, or other sensitive content through a disposable inbox. Anyone with access to an address may be able to view incoming messages.",
  },
  {
    title: "Availability",
    body: "The service is provided as is, without a guarantee that every address, domain, message, or feature will always be available. Features may change as the app evolves.",
  },
  {
    title: "User Responsibility",
    body: "You are responsible for how you use generated addresses and inbox content. If a website or platform does not allow disposable email addresses, respect its rules.",
  },
];

export function TermsPage() {
  usePageTitle("Terms - TempMail");

  return (
    <PageLayout>
      <div className="mx-auto w-full">
        <div className="border-b border-border pb-6">
          <p className="text-sm font-medium text-primary">Terms</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            Terms of Service
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            These terms describe the basic rules for using TempMail. By using the app, you agree to
            use it responsibly and only for lawful purposes.
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

        <div className="mt-10 rounded-md border border-border bg-card p-4 text-sm leading-6 text-muted-foreground">
          Questions about these terms can be handled through the support or contact channel provided
          with the deployed service.
        </div>
      </div>
    </PageLayout>
  );
}
