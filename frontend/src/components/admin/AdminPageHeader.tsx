import type { ReactNode } from "react";

type AdminPageHeaderProps = {
  title: string;
  description: string;
  actions?: ReactNode;
};

export function AdminPageHeader({ title, description, actions }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-2 border-b border-border pb-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm leading-5 text-muted-foreground">{description}</p>
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  );
}
