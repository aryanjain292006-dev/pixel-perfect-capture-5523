import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  Box,
  Check,
  Droplets,
  Package,
  QrCode as QrIcon,
  Send,
  Thermometer,
  TrendingUp,
  Truck,
  Weight,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { QrCode } from "@/components/honey/qr-code";
import { STORES, useHoney, type Batch } from "@/lib/honey-store";

export const Route = createFileRoute("/beekeeper")({
  head: () => ({
    meta: [
      { title: "Beekeeper Hub — Smart Hive IoT & Batch Management" },
      {
        name: "description",
        content:
          "Monitor hive temperature, humidity and weight, read AI yield forecasts, record harvests and generate QR batch labels.",
      },
      { property: "og:title", content: "Beekeeper Hub — Smart Hive IoT & Batch Management" },
      {
        property: "og:description",
        content: "AI-IoT hive monitoring plus harvest, packing, QR and dispatch workflows.",
      },
    ],
  }),
  component: BeekeeperDashboard,
});

function BeekeeperDashboard() {
  const { hives, batches, recordHarvest, advance, dispatchBatch, beekeepers } = useHoney();
  const [hiveId, setHiveId] = useState(hives[0].id);
  const [alertOpen, setAlertOpen] = useState(true);
  const [qrBatch, setQrBatch] = useState<Batch | null>(null);
  const [harvest, setHarvest] = useState({ hiveId: hives[0].id, location: "Barabanki, Uttar Pradesh", kg: "20" });
  const [dispatchTarget, setDispatchTarget] = useState<{ batchId: string; store: string }>({
    batchId: "",
    store: STORES[0],
  });

  const hive = hives.find((h) => h.id === hiveId) ?? hives[0];
  const myBatches = batches;
  const packed = myBatches.filter((b) => b.status === "packed");

  const submitHarvest = (e: React.FormEvent) => {
    e.preventDefault();
    const kg = Number(harvest.kg);
    if (!kg || !harvest.location) {
      toast.error("Enter harvest amount and location.");
      return;
    }
    const b = recordHarvest({
      beekeeperId: beekeepers[0].id,
      hiveId: harvest.hiveId,
      location: harvest.location,
      harvestKg: kg,
    });
    toast.success(`Harvest recorded · batch ${b.id} created on chain`);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-honey-deep">
            Beekeeper · {beekeepers[0].name} · {beekeepers[0].id}
          </p>
          <h1 className="mt-1 text-3xl font-semibold sm:text-4xl">Smart hive hub</h1>
          <p className="mt-2 text-muted-foreground">
            Live IoT telemetry, AI analytics and your harvest-to-dispatch workflow.
          </p>
        </div>
        <Badge variant="outline" className="border-leaf/40 bg-leaf-soft text-leaf">
          <Activity className="mr-1 size-3.5" /> 4 sensors online
        </Badge>
      </header>

      {alertOpen && (
        <div className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl border border-warning/40 bg-secondary p-5 shadow-soft">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-warning/15 text-warning">
            <AlertTriangle className="size-5" />
          </span>
          <div className="min-w-48 flex-1">
            <p className="font-display text-base font-semibold text-warning-foreground">
              AI anomaly detected: sudden temperature rise in Hive 03
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              39.6°C recorded, 5.4°C above the colony baseline. Likely absconding risk — add shade
              netting and check ventilation within 6 hours.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="rounded-lg"
              onClick={() => {
                setHiveId("HIVE-03");
                toast.success("Opened Hive 03 telemetry");
              }}
            >
              Inspect hive
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="rounded-lg"
              onClick={() => setAlertOpen(false)}
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Hive monitoring */}
      <section className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-semibold">Smart hive monitoring</h2>
          <div className="flex flex-wrap gap-2">
            {hives.map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => setHiveId(h.id)}
                className={`rounded-xl border px-3.5 py-2 text-sm font-medium transition-all ${
                  h.id === hiveId
                    ? "border-transparent bg-gradient-honey text-primary-foreground shadow-soft"
                    : "border-border bg-card text-muted-foreground hover:bg-honey-soft hover:text-foreground"
                }`}
              >
                {h.id}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Thermometer}
            label="Temperature"
            value={hive.temperature}
            unit="°C"
            hint="Ideal 32–35 °C"
            tone={hive.temperature > 36 ? "warning" : "honey"}
          />
          <StatCard
            icon={Droplets}
            label="Humidity"
            value={hive.humidity}
            unit="%"
            hint="Ideal 50–65 %"
            tone="leaf"
          />
          <StatCard
            icon={Weight}
            label="Hive weight"
            value={hive.weight}
            unit="kg"
            hint="+2.4 kg in 24 h"
          />
          <StatCard
            icon={TrendingUp}
            label="Predicted yield"
            value={hive.yieldForecast}
            unit="kg"
            hint="Next 14 days · AI model v3"
            tone="leaf"
          />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-soft lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display text-lg font-semibold">
                Temperature &amp; humidity · last 24 h
              </h3>
              <span className="text-xs text-muted-foreground">{hive.label}</span>
            </div>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hive.series} margin={{ left: -18, right: 6, top: 6 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    stroke="var(--color-chart-1)"
                    strokeWidth={2.5}
                    dot={false}
                    name="Temp °C"
                  />
                  <Line
                    type="monotone"
                    dataKey="humidity"
                    stroke="var(--color-chart-2)"
                    strokeWidth={2.5}
                    dot={false}
                    name="Humidity %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
            <h3 className="font-display text-lg font-semibold">Hive weight trend</h3>
            <div className="mt-4 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hive.series} margin={{ left: -24, right: 4, top: 6 }}>
                  <defs>
                    <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="var(--color-muted-foreground)" />
                  <YAxis tick={{ fontSize: 10 }} stroke="var(--color-muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="weight"
                    stroke="var(--color-chart-1)"
                    strokeWidth={2.5}
                    fill="url(#wGrad)"
                    name="Weight kg"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-5 space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Colony health</span>
                  <span
                    className={
                      hive.health === "Critical"
                        ? "font-semibold text-destructive"
                        : hive.health === "Watch"
                          ? "font-semibold text-warning"
                          : "font-semibold text-leaf"
                    }
                  >
                    {hive.health}
                  </span>
                </div>
                <Progress
                  value={hive.health === "Healthy" ? 88 : hive.health === "Watch" ? 62 : 34}
                  className="mt-2"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Model inputs: brood pattern, entrance activity, weight delta, ambient weather.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Harvest & batch workflow */}
      <section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,24rem)_1fr]">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <span className="inline-flex items-center gap-2 rounded-full bg-honey-soft px-3 py-1 text-xs font-semibold text-honey-deep">
            Step 1 · Record harvest
          </span>
          <h2 className="mt-3 font-display text-xl font-semibold">New harvest</h2>
          <form onSubmit={submitHarvest} className="mt-5 space-y-4">
            <div className="space-y-1.5">
              <Label>Hive</Label>
              <Select
                value={harvest.hiveId}
                onValueChange={(v) => setHarvest({ ...harvest, hiveId: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {hives.map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="loc">Harvest location</Label>
              <Input
                id="loc"
                value={harvest.location}
                onChange={(e) => setHarvest({ ...harvest, location: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="kg">Amount harvested (kg)</Label>
              <Input
                id="kg"
                type="number"
                min={1}
                step="0.1"
                value={harvest.kg}
                onChange={(e) => setHarvest({ ...harvest, kg: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full rounded-xl">
              <Box className="size-4.5" /> Record harvest &amp; create batch
            </Button>
          </form>

          <div className="mt-7 border-t border-border pt-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-honey-soft px-3 py-1 text-xs font-semibold text-honey-deep">
              Step 4 · Dispatch
            </span>
            <h3 className="mt-3 font-display text-lg font-semibold">Transfer to store owner</h3>
            <div className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <Label>Packed batch</Label>
                <Select
                  value={dispatchTarget.batchId}
                  onValueChange={(v) => setDispatchTarget({ ...dispatchTarget, batchId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={packed.length ? "Select batch" : "No packed batches"} />
                  </SelectTrigger>
                  <SelectContent>
                    {packed.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Store owner</Label>
                <Select
                  value={dispatchTarget.store}
                  onValueChange={(v) => setDispatchTarget({ ...dispatchTarget, store: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STORES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="secondary"
                className="w-full rounded-xl"
                disabled={!dispatchTarget.batchId}
                onClick={() => {
                  dispatchBatch(dispatchTarget.batchId, dispatchTarget.store);
                  toast.success(`${dispatchTarget.batchId} dispatched to ${dispatchTarget.store}`);
                  setDispatchTarget({ batchId: "", store: dispatchTarget.store });
                }}
              >
                <Send className="size-4.5" /> Dispatch batch
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-6 py-5">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-honey-soft px-3 py-1 text-xs font-semibold text-honey-deep">
                Steps 2–3 · Batch management
              </span>
              <h2 className="mt-2 font-display text-xl font-semibold">My batches</h2>
            </div>
            <span className="text-sm text-muted-foreground">{myBatches.length} batches</span>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch</TableHead>
                  <TableHead>Hive</TableHead>
                  <TableHead className="text-right">Kg</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myBatches.map((b) => (
                  <TableRow key={b.id} className="transition-colors hover:bg-honey-soft/60">
                    <TableCell>
                      <p className="font-mono text-xs font-medium">{b.id}</p>
                      <p className="text-xs text-muted-foreground">{b.floralSource} · {b.location}</p>
                    </TableCell>
                    <TableCell className="text-sm">{b.hiveId}</TableCell>
                    <TableCell className="text-right tabular-nums">{b.harvestKg}</TableCell>
                    <TableCell>
                      <StatusBadge stage={b.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap justify-end gap-2">
                        {b.status === "harvested" && (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="rounded-lg"
                            onClick={() => {
                              advance(b.id, "extracted");
                              toast.success(`${b.id} marked extracted`);
                            }}
                          >
                            <Check className="size-4" /> Mark extracted
                          </Button>
                        )}
                        {b.status === "extracted" && (
                          <Button
                            size="sm"
                            className="rounded-lg"
                            onClick={() => {
                              advance(b.id, "packed");
                              toast.success(`${b.id} marked packed`);
                            }}
                          >
                            <Package className="size-4" /> Mark packed
                          </Button>
                        )}
                        {(b.status === "packed" ||
                          b.status === "dispatched" ||
                          b.status === "available") && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-lg"
                            onClick={() => setQrBatch(b)}
                          >
                            <QrIcon className="size-4" /> QR label
                          </Button>
                        )}
                        {b.storeOwner && (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Truck className="size-3.5" /> {b.storeOwner}
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>

      <Dialog open={Boolean(qrBatch)} onOpenChange={(o) => !o && setQrBatch(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Batch label generated</DialogTitle>
            <DialogDescription>
              Print this label on every bottle from this batch. The scratch code sits under the
              silver panel on the cap.
            </DialogDescription>
          </DialogHeader>
          {qrBatch && (
            <div className="rounded-2xl border border-border bg-gradient-dawn p-6 text-center">
              <QrCode value={qrBatch.scratchCode} className="mx-auto size-44 text-foreground" />
              <p className="mt-4 font-mono text-xs text-muted-foreground">{qrBatch.id}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-honey-deep">
                Scratch code
              </p>
              <p className="font-display text-2xl font-semibold tracking-widest">
                {qrBatch.scratchCode}
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                {qrBatch.floralSource} honey · {qrBatch.harvestKg} kg · {qrBatch.location}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
