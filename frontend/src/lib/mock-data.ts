export type MockEmail = {
  id: string;
  from: string;
  fromEmail: string;
  subject: string;
  preview: string;
  body: string;
  time: string;
  unread: boolean;
  avatarColor: string;
};

export const DOMAINS = [
  { value: "mailbox.one", label: "@mailbox.one", badge: "POPULAR" as const },
  { value: "tempmail.dev", label: "@tempmail.dev", badge: "NEW" as const },
  { value: "mailbox.plus", label: "@mailbox.plus" },
  { value: "maildrop.cc", label: "@maildrop.cc" },
  { value: "inboxly.io", label: "@inboxly.io", badge: "NEW" as const },
  { value: "flashmail.xyz", label: "@flashmail.xyz" },
];

export const MOCK_EMAILS: MockEmail[] = [
  {
    id: "1",
    from: "GitHub",
    fromEmail: "noreply@github.com",
    subject: "Verify your email address",
    preview: "Please verify your email address to complete your GitHub account setup...",
    body: "Hi there,\n\nPlease verify your email address to complete your GitHub account setup. Click the link below to confirm.\n\nVerify email\n\nThanks,\nThe GitHub Team",
    time: "2m ago",
    unread: true,
    avatarColor: "from-slate-700 to-slate-900",
  },
  {
    id: "2",
    from: "Vercel",
    fromEmail: "no-reply@vercel.com",
    subject: "Your deployment is live 🚀",
    preview: "Your project has been deployed successfully to production...",
    body: "Great news!\n\nYour project has been deployed successfully. It's now live at your production URL.\n\nView deployment →",
    time: "12m ago",
    unread: true,
    avatarColor: "from-neutral-800 to-black",
  },
  {
    id: "3",
    from: "Linear",
    fromEmail: "notifications@linear.app",
    subject: "New issue assigned to you",
    preview: "ENG-482: Fix layout shift on dashboard page has been assigned to you...",
    body: "You've been assigned a new issue.\n\nENG-482: Fix layout shift on dashboard page\nPriority: High\n\nOpen in Linear →",
    time: "34m ago",
    unread: true,
    avatarColor: "from-indigo-500 to-violet-600",
  },
  {
    id: "4",
    from: "Notion",
    fromEmail: "team@notion.so",
    subject: "Weekly digest — 3 pages updated",
    preview: "Here's what happened in your workspace this week...",
    body: "Your weekly digest is ready.\n\n• 3 pages updated\n• 5 new comments\n• 2 new members joined\n\nOpen workspace →",
    time: "1h ago",
    unread: false,
    avatarColor: "from-zinc-100 to-zinc-300",
  },
  {
    id: "5",
    from: "Stripe",
    fromEmail: "receipts@stripe.com",
    subject: "Receipt for your payment",
    preview: "Your payment of $29.00 was successful. Here is your receipt...",
    body: "Payment successful.\n\nAmount: $29.00\nDate: Today\nCard: •••• 4242\n\nDownload receipt →",
    time: "3h ago",
    unread: false,
    avatarColor: "from-violet-500 to-purple-700",
  },
  {
    id: "6",
    from: "Figma",
    fromEmail: "hello@figma.com",
    subject: "You were mentioned in Design System",
    preview: "@you mentioned in a comment: Can we align the spacing here?...",
    body: "You were mentioned in a comment.\n\n'Can we align the spacing here? I think 16px would work better.'\n\nView in Figma →",
    time: "5h ago",
    unread: true,
    avatarColor: "from-pink-500 to-orange-500",
  },
  {
    id: "7",
    from: "Discord",
    fromEmail: "noreply@discord.com",
    subject: "New login to your account",
    preview: "A new login was detected on your account from Chrome on macOS...",
    body: "New login detected.\n\nBrowser: Chrome\nOS: macOS\nLocation: San Francisco, CA\n\nIf this wasn't you, secure your account.",
    time: "8h ago",
    unread: false,
    avatarColor: "from-indigo-400 to-indigo-700",
  },
  {
    id: "8",
    from: "Cloudflare",
    fromEmail: "noreply@cloudflare.com",
    subject: "Your domain SSL certificate renewed",
    preview: "The SSL certificate for yourdomain.com has been renewed automatically...",
    body: "SSL renewed.\n\nDomain: yourdomain.com\nValid until: 12 months from now\n\nManage certificates →",
    time: "1d ago",
    unread: false,
    avatarColor: "from-orange-400 to-amber-600",
  },
  {
    id: "9",
    from: "Framer",
    fromEmail: "hello@framer.com",
    subject: "Your site is ready to publish",
    preview: "Everything looks great. Ready to share your site with the world?...",
    body: "Your site is ready.\n\nAll pages are optimized, forms connected, and animations tuned.\n\nPublish now →",
    time: "1d ago",
    unread: false,
    avatarColor: "from-blue-500 to-cyan-500",
  },
  {
    id: "10",
    from: "Supabase",
    fromEmail: "team@supabase.io",
    subject: "Weekly usage summary",
    preview: "Your project used 12% of its monthly database quota this week...",
    body: "Weekly summary.\n\n• Database: 12% used\n• Auth: 340 users\n• Storage: 2.1 GB\n\nView dashboard →",
    time: "2d ago",
    unread: false,
    avatarColor: "from-emerald-400 to-green-600",
  },
];
