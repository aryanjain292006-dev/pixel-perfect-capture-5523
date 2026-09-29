import { createFileRoute } from "@tanstack/react-router";
import { PackageCheck, ShoppingBasket, Store, Truck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatCard } from "@/components/honey/stat-card";
import { StatusBadge } from "@/components/honey/status-badge";
import { formatStamp, useHoney } from "@/lib/honey-store";

export const Route = createFileRoute("/store")({
  head: () => ({
    meta: [
      { title: "Store Owner Dashboard — Honey Chain" },
      {
        name: "description",
        content:
          "Confirm incoming honey shipments, manage inventory and list verified batches for consumer sale.",
      },
      { property: "og:title", content: "Store Owner Dashboard — Honey Chain" },
      {
        property: "og:description",
        content: "Shipment receipt confirmation and shelf listing that completes the blockchain trace.",
      },
    ],
  }),
  component: StoreDashboard,
});

const STORE_NAME = "Madhu Mart, Lucknow";

function StoreDashboard() {
  const { batches, advance } = useHoney();
  const mine = batches.filter((b) => b.storeOwner === STORE_NAME);
  const incoming = mine.filter((b) => b.status === "dispatched");
  const onShelf = mine.filter((b) => b.status === "available");
  const totalKg = mine.reduce((s, b) => s + b.harvestKg, 0);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-honey-deep">
            Retail partner
          </p>
          <h1 className="mt-1 text-3xl font-semibold sm:text-4xl">{STORE_NAME}</h1>
          <p className="mt-2 text-muted-foreground">
            Confirm receipts and list verified batches — the final link in the chain.
          </p>
        </div>
        <Badge variant="outline" className="border-leaf/40 bg-leaf-soft text-leaf">
          <Store className="mr-1 size-3.5" /> KVIC authorised outlet
        </Badge>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={PackageCheck} label="Batches in store" value={mine.length} hint="Lifetime received" />
        <StatCard icon={Truck} label="Awaiting receipt" value={incoming.length} hint="In transit now" tone="warning" />
        <StatCard icon={ShoppingBasket} label="On shelf" value={onShelf.length} hint="Live for consumers" tone="leaf" />
        <StatCard icon={Store} label="Honey handled" value={totalKg.toFixed(1)} unit="kg" hint="Across all batches" />
      </section>

      <section className="mt-8 overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
        <div className="border-b border-border px-6 py-5">
          <h2 className="font-display text-xl font-semibold">Incoming shipments</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Confirm receipt, then flip the shelf toggle to complete the blockchain trace.
          </p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch</TableHead>
                <TableHead>Beekeeper</TableHead>
                <TableHead className="text-right">Kg</TableHead>
                <TableHead>Dispatched</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mine.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    No shipments yet. Dispatch a packed batch from the Beekeeper Hub.
                  </TableCell>
                </TableRow>
              )}
              {mine.map((b) => {
                const dispatched = b.events.find((e) => e.stage === "dispatched");
                return (
                  <TableRow key={b.id} className="transition-colors hover:bg-honey-soft/60">
                    <TableCell>
                      <p className="font-mono text-xs font-medium">{b.id}</p>
                      <p className="text-xs text-muted-foreground">
                        {b.floralSource} · {b.location}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm">{b.beekeeperName}</TableCell>
                    <TableCell className="text-right tabular-nums">{b.harvestKg}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {dispatched ? formatStamp(dispatched.timestamp) : "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge stage={b.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-3">
                        {b.status === "dispatched" ? (
                          <Button
                            size="sm"
                            className="rounded-lg"
                            onClick={() => {
                              advance(b.id, "available", STORE_NAME);
                              toast.success(`Receipt confirmed for ${b.id}`);
                            }}
                          >
                            <PackageCheck className="size-4" /> Confirm receipt
                          </Button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Switch
                              id={`shelf-${b.id}`}
                              checked={b.status === "available"}
                              onCheckedChange={() => {
                                advance(b.id, "available", STORE_NAME);
                                toast.success(`${b.id} is live for consumers`);
                              }}
                            />
                            <Label htmlFor={`shelf-${b.id}`} className="text-xs">
                              Available for sale
                            </Label>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </section>
    </main>
  );
}
