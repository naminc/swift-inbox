import { useCallback } from "react";

import { EmailCreator } from "@/components/tempmail/EmailCreator";
import { EmailViewer } from "@/components/tempmail/EmailViewer";
import { StatusMessage } from "@/components/feedback/StatusMessage";
import { Footer } from "@/components/tempmail/Footer";
import { Header } from "@/components/tempmail/Header";
import { InboxList } from "@/components/tempmail/InboxList";
import { Toolbar } from "@/components/tempmail/Toolbar";
import { useCurrentMailbox } from "@/hooks/use-current-mailbox";
import { useInboxMessages } from "@/hooks/use-inbox-messages";
import { usePageTitle } from "@/hooks/use-page-title";
import { usePublicSettings } from "@/hooks/use-public-settings";
import { errorMessage } from "@/lib/errors";
import { SITE_DEFAULTS } from "@/lib/site-defaults";

export function Home() {
  const { data: publicSettings } = usePublicSettings();

  const siteTitle = publicSettings?.siteTitle || SITE_DEFAULTS.siteTitle;
  const heroHeading = publicSettings?.heroHeading || SITE_DEFAULTS.heroHeading;
  const heroSubheading = publicSettings?.heroSubheading || SITE_DEFAULTS.heroSubheading;

  usePageTitle(siteTitle);

  const mb = useCurrentMailbox();

  const inbox = useInboxMessages(mb.mailboxAddress, mb.isMailboxExpired, mb.setError);

  const isBusy = mb.isBusy || inbox.isRefreshPending;

  const handleRefresh = useCallback(() => {
    if (inbox.isRefreshPending || mb.isMaintenanceMode) return;

    if (mb.isMailboxExpired) {
      mb.setError("This mailbox has expired. Renew it to continue receiving mail.");
      return;
    }

    inbox.setIsRefreshPending(true);

    if (mb.mailbox) {
      void inbox.refetchMessages().finally(() => inbox.setIsRefreshPending(false));
      return;
    }

    void mb
      .createRandomMailbox()
      .catch((err) => mb.setError(errorMessage(err, "Could not create mailbox")))
      .finally(() => inbox.setIsRefreshPending(false));
  }, [inbox, mb]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <EmailCreator
        username={mb.username}
        domain={mb.domain}
        domains={mb.domainOptions}
        title={heroHeading}
        subtitle={heroSubheading}
        isLoading={mb.isDomainsLoading}
        isGenerating={mb.isGetEmailPending}
        disabled={mb.isGetEmailPending || mb.isMaintenanceMode}
        onUsernameChange={mb.handleUsernameChange}
        onDomainChange={mb.handleDomainChange}
        onGenerate={mb.handleCreate}
      />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-10">
        {mb.error && (
          <StatusMessage tone="error" className="mb-4">
            {mb.error}
          </StatusMessage>
        )}

        {mb.isMaintenanceMode && (
          <StatusMessage tone="warning" className="mb-4">
            {mb.maintenanceMessage}
          </StatusMessage>
        )}

        <Toolbar
          email={mb.email}
          disabled={isBusy || mb.isMaintenanceMode}
          expiryLabel={mb.expiryLabel}
          expiryTone={mb.expiryTone}
          isExpired={mb.isMailboxExpired}
          isRefreshing={inbox.isRefreshPending}
          isRenewing={mb.isRenewing}
          onRandom={mb.handleRandom}
          onRefresh={handleRefresh}
          onRenew={mb.mailbox ? () => void mb.handleRenew() : undefined}
          onDelete={() => void mb.handleDelete()}
        />

        <div className="mt-4 grid min-w-0 gap-4 overflow-hidden md:h-[560px] md:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
          <div className="h-[480px] min-h-0 min-w-0 overflow-hidden md:h-auto">
            <InboxList
              emails={inbox.emails}
              activeId={inbox.activeId}
              isLoading={inbox.isMessagesLoading}
              isRefreshDisabled={mb.isMailboxExpired || mb.isMaintenanceMode}
              isRandomDisabled={mb.isMaintenanceMode || isBusy}
              isRefreshing={inbox.isRefreshPending}
              onSelect={inbox.handleSelect}
              onRefresh={handleRefresh}
              onRandom={mb.handleRandom}
            />
          </div>
          <div className="min-h-0 min-w-0 overflow-hidden">
            <EmailViewer
              email={inbox.active}
              to={mb.email}
              isDeleting={inbox.isDeletingMessage}
              onDelete={inbox.handleDeleteMessage}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
