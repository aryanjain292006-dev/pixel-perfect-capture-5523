import { Badge } from "@/components/ui/badge";
import { STAGE_LABEL, type Stage } from "@/lib/honey-store";
import { cn } from "@/lib/utils";

const TONE: Record<Stage, string> = {
  harvested: "bg-honey-soft text-honey-deep",
  extracted: "bg-secondary text-secondary-foreground",
  packed: "bg-accent text-accent-foreground",
  dispatched: "bg-honey text-primary-foreground",
  available: "bg-leaf text-primary-foreground",
};

export function StatusBadge({ stage, className }: { stage: Stage; className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("border-transparent font-semibold", TONE[stage], className)}
    >
      {STAGE_LABEL[stage]}
    </Badge>
  );
}
