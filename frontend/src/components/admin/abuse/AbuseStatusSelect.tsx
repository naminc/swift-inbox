import type { AbuseReportStatus } from "@/types/abuse";

type AbuseStatusSelectProps = {
  value: AbuseReportStatus;
  onChange: (status: AbuseReportStatus) => void;
  disabled?: boolean;
  className?: string;
};

export function AbuseStatusSelect({
  value,
  onChange,
  disabled,
  className,
}: AbuseStatusSelectProps) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as AbuseReportStatus)}
      disabled={disabled}
      className={className}
    >
      <option value="new">New</option>
      <option value="reviewed">Reviewed</option>
      <option value="resolved">Resolved</option>
    </select>
  );
}
