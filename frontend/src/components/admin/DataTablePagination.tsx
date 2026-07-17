import { Button } from "@/components/ui/button";

type DataTablePaginationProps = {
  page: number;
  totalPages: number;
  isLoading: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export function DataTablePagination({
  page,
  totalPages,
  isLoading,
  onPrev,
  onNext,
}: DataTablePaginationProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
      <span>
        Page {page} of {totalPages}
      </span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={isLoading || page <= 1} onClick={onPrev}>
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={isLoading || page >= totalPages}
          onClick={onNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
