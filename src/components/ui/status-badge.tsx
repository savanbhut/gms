import { cn } from '@/lib/utils';
import type { BookingStatus, PaymentStatus } from '@/types/gms';

type Status = BookingStatus | PaymentStatus | 'Active' | 'Inactive';

const statusStyles: Record<Status, string> = {
  Pending: 'bg-warning/10 text-warning border-warning/20',
  'In Progress': 'bg-info/10 text-info border-info/20',
  Completed: 'bg-success/10 text-success border-success/20',
  Cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
  Success: 'bg-success/10 text-success border-success/20',
  Failed: 'bg-destructive/10 text-destructive border-destructive/20',
  Active: 'bg-success/10 text-success border-success/20',
  Inactive: 'bg-muted text-muted-foreground border-muted',
};

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        statusStyles[status],
        className
      )}
    >
      {status}
    </span>
  );
}
