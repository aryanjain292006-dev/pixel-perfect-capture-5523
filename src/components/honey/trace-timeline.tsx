import { Check, Clock, Copy, Link2 } from "lucide-react";
import { toast } from "sonner";
import {
  formatStamp,
  STAGE_LABEL,
  STAGE_ORDER,
  type Batch,
  type Stage,
} from "@/lib/honey-store";
import { cn } from "@/lib/utils";

const STAGE_HINT: Record<Stage, string> = {
  harvested: "Frames lifted from the hive, weight logged by the beekeeper",
  extracted: "Cold extracted and moisture tested at the village unit",
  packed: "Bottled, sealed and labelled with this QR + scratch code",
  dispatched: "Custody transferred to the retail partner",
  available: "Verified on shelf — safe to buy",
};

export function TraceTimeline({ batch }: { batch: Batch }) {
  return (
    <ol className="relative">
      {STAGE_ORDER.map((stage, i) => {
        const event = batch.events.find((e) => e.stage === stage);
        const done = Boolean(event);
        const isLast = i === STAGE_ORDER.length - 1;

        return (
          <li key={stage} className="relative flex gap-4 pb-8 last:pb-0">
            {!isLast && (
              <span
                aria-hidden
                className={cn(
                  "absolute left-[19px] top-10 h-[calc(100%-2.5rem)] w-0.5 rounded",
                  done ? "bg-honey" : "bg-border",
                )}
              />
            )}
            <span
              className={cn(
                "z-10 grid size-10 shrink-0 place-items-center rounded-full border-2 transition-all duration-300",
                done
                  ? "border-transparent bg-gradient-honey text-primary-foreground shadow-glow"
                  : "border-dashed border-border bg-card text-muted-foreground",
              )}
            >
              {done ? <Check className="size-5" strokeWidth={3} /> : <Clock className="size-4" />}
            </span>

            <div
              className={cn(
                "min-w-0 flex-1 rounded-2xl border p-4 transition-colors",
                done ? "border-border bg-card shadow-soft" : "border-dashed border-border bg-muted/40",
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-display text-base font-semibold">{STAGE_LABEL[stage]}</h4>
                <span className="text-xs font-medium text-muted-foreground">
                  {event ? formatStamp(event.timestamp) : "Pending"}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {event?.note ?? STAGE_HINT[stage]}
              </p>
              {event && (
                <>
                  <p className="mt-2 text-xs font-medium text-foreground/80">By {event.actor}</p>
                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard?.writeText(event.hash);
                      toast.success("Transaction hash copied");
                    }}
                    className="group mt-2 flex w-full items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-left transition-colors hover:bg-honey-soft"
                  >
                    <Link2 className="size-3.5 shrink-0 text-honey-deep" />
                    <code className="truncate font-mono text-[11px] text-muted-foreground">
                      {event.hash}
                    </code>
                    <Copy className="ml-auto size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                </>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
