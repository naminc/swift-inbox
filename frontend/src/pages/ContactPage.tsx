import { FormEvent, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { StatusMessage } from "@/components/feedback/StatusMessage";
import { PageLayout } from "@/components/tempmail/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usePageTitle } from "@/hooks/use-page-title";
import { usePublicSettings } from "@/hooks/use-public-settings";
import { createAbuseReport } from "@/lib/api";
import { errorMessage } from "@/lib/errors";
import { queryKeys } from "@/lib/query-keys";
import { SITE_DEFAULTS } from "@/lib/site-defaults";
import { validateContactForm } from "@/lib/validation";

export function ContactPage() {
  const queryClient = useQueryClient();
  const { data: publicSettings } = usePublicSettings();
  const siteName = publicSettings?.siteName || SITE_DEFAULTS.siteName;
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const createAbuseReportMutation = useMutation({
    mutationFn: createAbuseReport,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.abuseReportsRoot,
      });
    },
  });

  usePageTitle(`Contact - ${siteName}`);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextEmail = email.trim();
    const nextMessage = message.trim();
    const validationError = validateContactForm({
      email: nextEmail,
      message: nextMessage,
    });

    if (validationError) {
      setError(validationError);
      setSuccess(null);
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      await createAbuseReportMutation.mutateAsync({
        ...(nextEmail && { email: nextEmail }),
        message: nextMessage,
      });

      setMessage("");
      setSuccess("Thanks. Your report has been submitted.");
    } catch (nextError) {
      setError(errorMessage(nextError, "Could not submit your report."));
    }
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
          {error && (
            <StatusMessage tone="error" className="px-3 py-2">
              {error}
            </StatusMessage>
          )}

          {success && (
            <StatusMessage tone="success" className="px-3 py-2">
              {success}
            </StatusMessage>
          )}

          <div>
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email optional
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="mt-2"
            />
          </div>

          <div>
            <label htmlFor="message" className="text-sm font-medium text-foreground">
              Message
            </label>
            <Textarea
              id="message"
              rows={7}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Describe what happened..."
              className="mt-2 resize-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={createAbuseReportMutation.isPending}>
              {createAbuseReportMutation.isPending ? "Submitting..." : "Submit"}
            </Button>
            <p className="text-sm text-muted-foreground">
              Reports are reviewed by the {siteName} operations team.
            </p>
          </div>
        </form>
      </div>
    </PageLayout>
  );
}
