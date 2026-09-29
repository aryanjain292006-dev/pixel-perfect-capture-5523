import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Boxes, Copy, KeyRound, Leaf, PlusCircle, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { formatStamp, useHoney, type Beekeeper } from "@/lib/honey-store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "KVIC Admin Dashboard — Honey Chain" },
      {
        name: "description",
        content:
          "Issue bee boxes, onboard beekeepers and monitor honey tracked across the KVIC network.",
      },
      { property: "og:title", content: "KVIC Admin Dashboard — Honey Chain" },
      {
        property: "og:description",
        content: "Onboarding, bee box distribution and network-wide honey traceability metrics.",
      },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { beekeepers, batches, addBeekeeper } = useHoney();
  const [form, setForm] = useState({ name: "", village: "", state: "", boxes: "12" });
  const [issued, setIssued] = useState<Beekeeper | null>(null);

  const totalBoxes = beekeepers.reduce((s, b) => s + b.boxes, 0);
  const totalHoney = beekeepers.reduce((s, b) => s + b.honeyKg, 0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.village || !form.state) {
      toast.error("Please fill beekeeper name, village and state.");
      return;
    }
    const created = addBeekeeper({
      name: form.name,
      village: form.village,
      state: form.state,
      boxes: Number(form.boxes) || 0,
    });
    setIssued(created);
    setForm({ name: "", village: "", state: "", boxes: "12" });
    toast.success(`Bee box issued to ${created.name}`);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-honey-deep">
            KVIC Administration
          </p>
          <h1 className="mt-1 text-3xl font-semibold sm:text-4xl">Network overview</h1>
          <p className="mt-2 text-muted-foreground">
            Honey Mission onboarding, bee box distribution and chain-wide traceability.
          </p>
        </div>
        <Badge variant="outline" className="border-leaf/40 bg-leaf-soft text-leaf">
          Ledger synced · block #8,412,776
        </Badge>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Users}
          label="Beekeepers onboarded"
          value={(12480 + beekeepers.length).toLocaleString("en-IN")}
          hint="+184 this quarter"
        />
        <StatCard
          icon={Boxes}
          label="Bee boxes distributed"
          value={(186200 + totalBoxes).toLocaleString("en-IN")}
          hint="Across 21 states"
          tone="leaf"
        />
        <StatCard
          icon={Leaf}
          label="Honey tracked"
          value={(9412 + Math.round(totalHoney / 1000)).toLocaleString("en-IN")}
          unit="t"
          hint={`${batches.length} live batches on chain`}
        />
        <StatCard
          icon={KeyRound}
          label="Verified consumer scans"
          value="4,81,932"
          hint="98.2% authenticity rate"
          tone="warning"
        />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,24rem)_1fr]">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-display text-xl font-semibold">Issue bee box</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Creates a beekeeper ID and a first-login password.
          </p>
          <form onSubmit={submit} className="mt-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Beekeeper name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Suman Bai"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="village">Village / block</Label>
                <Input
                  id="village"
                  value={form.village}
                  onChange={(e) => setForm({ ...form, village: e.target.value })}
                  placeholder="Barabanki"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  placeholder="Uttar Pradesh"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="boxes">Bee boxes issued</Label>
              <Input
                id="boxes"
                type="number"
                min={1}
                value={form.boxes}
                onChange={(e) => setForm({ ...form, boxes: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full rounded-xl">
              <PlusCircle className="size-4.5" /> Generate credentials
            </Button>
          </form>

          {issued && (
            <div className="mt-5 rounded-2xl border border-honey/40 bg-honey-soft p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-honey-deep">
                Credentials issued
              </p>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Beekeeper ID</dt>
                  <dd className="font-mono font-semibold">{issued.id}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Password</dt>
                  <dd className="font-mono font-semibold">{issued.password}</dd>
                </div>
              </dl>
              <Button
                variant="secondary"
                size="sm"
                className="mt-3 w-full rounded-lg"
                onClick={() => {
                  void navigator.clipboard?.writeText(`${issued.id} / ${issued.password}`);
                  toast.success("Credentials copied");
                }}
              >
                <Copy className="size-4" /> Copy credentials
              </Button>
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-6 py-5">
            <h2 className="font-display text-xl font-semibold">Registered beekeepers</h2>
            <span className="text-sm text-muted-foreground">{beekeepers.length} records</span>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Beekeeper ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Boxes</TableHead>
                  <TableHead className="text-right">Honey (kg)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Onboarded</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {beekeepers.map((b) => (
                  <TableRow key={b.id} className="transition-colors hover:bg-honey-soft/60">
                    <TableCell className="font-mono text-xs">{b.id}</TableCell>
                    <TableCell className="font-medium">{b.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {b.village}, {b.state}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{b.boxes}</TableCell>
                    <TableCell className="text-right tabular-nums">{b.honeyKg}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          b.status === "Active"
                            ? "border-transparent bg-leaf-soft text-leaf"
                            : "border-transparent bg-honey-soft text-honey-deep"
                        }
                      >
                        {b.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatStamp(b.joined)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>
    </main>
  );
}
