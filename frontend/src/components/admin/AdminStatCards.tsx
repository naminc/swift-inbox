type StatItem = {
  label: string;
  value: React.ReactNode;
  className?: string;
};

type AdminStatCardsProps = {
  items: StatItem[];
};

export function AdminStatCards({ items }: AdminStatCardsProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-md border border-border bg-card p-3">
          <div className="text-xs text-muted-foreground">{item.label}</div>
          <div className={item.className ?? "mt-0.5 text-xl font-semibold"}>{item.value}</div>
        </div>
      ))}
    </div>
  );
}
