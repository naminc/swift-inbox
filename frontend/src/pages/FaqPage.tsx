import { PageLayout } from "@/components/tempmail/PageLayout";
import { usePageTitle } from "@/hooks/use-page-title";

const questions = [
  {
    question: "What is a temporary email?",
    answer:
      "A temporary email is a disposable address you can use when you do not want to share your primary inbox.",
  },
  {
    question: "How long do messages last?",
    answer:
      "Messages are temporary and may disappear when the inbox refreshes, the domain changes, or the session is cleared.",
  },
  {
    question: "Can I use it for important accounts?",
    answer:
      "No. Use a permanent inbox for banking, recovery emails, paid services, work accounts, and anything you need to keep.",
  },
  {
    question: "Can I receive OTP codes?",
    answer:
      "Some services may send OTP codes to disposable inboxes, but others block temporary domains. Do not rely on it for critical access.",
  },
  {
    question: "Why did my inbox disappear?",
    answer:
      "Disposable inboxes are short-lived by design. Refreshes, browser changes, and domain availability can affect what you see.",
  },
  {
    question: "Is this private?",
    answer:
      "It is useful for reducing exposure of your personal address, but temporary inboxes should not be treated as secure storage.",
  },
  {
    question: "Can I choose another address?",
    answer:
      "Yes. You can edit the username, change the domain, or use the random generator on the home page.",
  },
];

export function FaqPage() {
  usePageTitle("FAQ - TempMail");

  return (
    <PageLayout>
      <div className="mx-auto w-full">
        <div className="border-b border-border pb-6">
          <p className="text-sm font-medium text-primary">FAQ</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            Frequently Asked Questions
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Quick answers about disposable addresses, inbox lifetime, and responsible use.
          </p>
        </div>

        <div className="mt-8 divide-y divide-border rounded-md border border-border bg-card">
          {questions.map((item) => (
            <section key={item.question} className="p-4">
              <h2 className="text-sm font-semibold text-foreground">{item.question}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.answer}</p>
            </section>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
