import { PageLayout } from "@/components/tempmail/PageLayout";
import { usePageTitle } from "@/hooks/use-page-title";

const options = [
  {
    title: "One-time support",
    description: "Help cover domains, monitoring, and maintenance.",
  },
  {
    title: "Monthly support",
    description: "Support reliability work and future inbox improvements.",
  },
  {
    title: "Crypto or external link",
    description: "A lightweight option for deployments that prefer external support links.",
  },
];

export function DonatePage() {
  usePageTitle("Donate - TempMail");

  return (
    <PageLayout>
      <div className="mx-auto w-full">
        <div className="border-b border-border pb-6">
          <p className="text-sm font-medium text-primary">Donate</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            Support TempMail
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Support helps keep domains running, improve reliability, and reduce the need for noisy
            ads or intrusive tracking.
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {options.map((option) => (
            <section key={option.title} className="rounded-md border border-border bg-card p-4">
              <h2 className="text-sm font-semibold text-foreground">{option.title}</h2>
              <p className="mt-2 min-h-16 text-sm leading-6 text-muted-foreground">
                {option.description}
              </p>
              <button
                type="button"
                disabled
                className="mt-4 w-full rounded-md border border-border px-3 py-2 text-sm text-muted-foreground"
              >
                Coming soon
              </button>
            </section>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
