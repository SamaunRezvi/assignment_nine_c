import { Check } from 'lucide-react';
import { formatDateTime } from '@/lib/helpers';
import type { StatusHistoryEntry } from '@/lib/types';

const TIMELINE_STEPS = [
  { key: 'requested', label: 'Requested' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
  { key: 'paid', label: 'Paid' },
];

const TERMINAL_STEPS: Record<string, { label: string }> = {
  rejected: { label: 'Rejected' },
  cancelled: { label: 'Cancelled' },
};

export function BookingTimeline({ statusHistory }: { statusHistory: StatusHistoryEntry[] }) {
  const historyByStatus = new Map(statusHistory.map((entry) => [entry.status, entry]));

  const terminalEntry = statusHistory.find((entry) => entry.status in TERMINAL_STEPS);

  if (terminalEntry) {
    const terminal = TERMINAL_STEPS[terminalEntry.status];
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
          <Check className="h-3.5 w-3.5" />
        </span>
        <span className="font-medium text-red-600">{terminal.label}</span>
        <span className="text-xs text-muted-foreground">{formatDateTime(terminalEntry.changedAt)}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-1 gap-y-2">
      {TIMELINE_STEPS.map((step, i) => {
        const entry = historyByStatus.get(step.key);
        const done = Boolean(entry);
        const isLast = i === TIMELINE_STEPS.length - 1;

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                  done ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : <span className="text-[10px]">{i + 1}</span>}
              </span>
              <div className="text-center">
                <p className={`text-xs ${done ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                  {step.label}
                </p>
                {entry && <p className="text-[10px] text-muted-foreground">{formatDateTime(entry.changedAt)}</p>}
              </div>
            </div>
            {!isLast && <div className={`mb-5 h-px w-8 ${done ? 'bg-primary' : 'bg-border'}`} />}
          </div>
        );
      })}
    </div>
  );
}
