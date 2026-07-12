import { FormEvent, useState } from "react";

import { PageLayout } from "@/components/tempmail/PageLayout";
import { usePageTitle } from "@/hooks/use-page-title";

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  usePageTitle("Contact - TempMail");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <PageLayout>
      <div className="mx-auto w-full">
        <div className="border-b border-border pb-6">
          <p className="text-sm font-medium text-primary">Contact</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            Contact and Abuse Reports
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Send a support note or report misuse. For abuse reports, include the address, domain,
            timestamp, and any relevant context.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-4 rounded-md border border-border bg-card p-4"
        >
          <div>
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email optional
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
            />
          </div>

          <div>
            <label htmlFor="topic" className="text-sm font-medium text-foreground">
              Topic
            </label>
            <select
              id="topic"
              className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/60"
            >
              <option>General support</option>
              <option>Abuse report</option>
              <option>Domain issue</option>
              <option>Feature request</option>
            </select>
          </div>

          <div>
            <label htmlFor="message" className="text-sm font-medium text-foreground">
              Message
            </label>
            <textarea
              id="message"
              rows={6}
              placeholder="Describe what happened..."
              className="mt-2 w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Submit
            </button>
            {submitted && (
              <p className="text-sm text-muted-foreground">
                Message captured locally. Connect a backend before sending real reports.
              </p>
            )}
          </div>
        </form>
      </div>
    </PageLayout>
  );
}
