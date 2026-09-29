import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  BadgeCheck,
  Boxes,
  Hexagon,
  Leaf,
  QrCode as QrIcon,
  ScanLine,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatWidget } from "@/components/honey/chat-widget";
import { TraceTimeline } from "@/components/honey/trace-timeline";
import { StatusBadge } from "@/components/honey/status-badge";
import { useHoney, type Batch } from "@/lib/honey-store";
import heroImg from "@/assets/hero-apiary.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Honey Chain — Verify Every Drop of KVIC Honey" },
      {
        name: "description",
        content:
          "Scan or enter your scratch code to trace KVIC honey from hive to shelf on the blockchain, powered by AI-IoT smart beekeeping.",
      },
      { property: "og:title", content: "Honey Chain — Verify Every Drop of KVIC Honey" },
      {
        property: "og:description",
        content:
          "Blockchain traceability and smart hive monitoring for India's honey mission. Verify your bottle in seconds.",
      },
    ],
  }),
  component: ConsumerPortal,
});


function ConsumerPortal() {
  const { findByCode, batches } = useHoney();
  const [code, setCode] = useState("");
  const [result, setResult] = useState<Batch | null>(null);
  const [scanning, setScanning] = useState(false);

  const verify = (raw: string) => {
    const found = findByCode(raw);
    if (!found) {
      setResult(null);
      toast.error("No record found for that code. Try HNY7-4KQ2-9XTM.");
      return;
    }
    setResult(found);
    toast.success(`Batch ${found.id} verified on chain`);
  };

  const simulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      const sample = batches.find((b) => b.status === "available") ?? batches[0]!;
      setScanning(false);
      setCode(sample.scratchCode);
      verify(sample.scratchCode);
    }, 1400);
  };

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-dawn">
        <div className="absolute inset-0 comb-pattern opacity-60" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1.5 text-xs font-semibold text-honey-deep shadow-soft">
              <Hexagon className="size-3.5" /> SIH Problem 26021 · KVIC Honey Mission
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-6xl">
              Every drop of honey,
              <span className="block text-honey-deep">traced from hive to shelf.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Honey Chain links 1.2 lakh KVIC beekeepers, AI-IoT smart hives and an immutable
              blockchain ledger — so a family in any city can prove their honey is pure, and the
              beekeeper who made it gets the credit.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                size="lg"
                className="rounded-xl"
                onClick={() =>
                  document.getElementById("verify")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                <ShieldCheck className="size-4.5" /> Verify your honey
              </Button>
              <Button size="lg" variant="outline" className="rounded-xl">
                <Sparkles className="size-4.5" /> About the mission
              </Button>
            </div>
            <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-border/70 pt-6">
              {[
                { icon: Users, k: "12,480", v: "Beekeepers" },
                { icon: Boxes, k: "1,86,200", v: "Bee boxes" },
                { icon: Leaf, k: "9,412 t", v: "Honey traced" },
              ].map((s) => (
                <div key={s.v}>
                  <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <s.icon className="size-3.5" /> {s.v}
                  </dt>
                  <dd className="mt-1 font-display text-2xl font-semibold">{s.k}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-border shadow-glow">
              <img
                src={heroImg}
                alt="Beehive boxes in a flowering mustard field at golden hour"
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                loading="eager"
              />
            </div>
            <div className="absolute -bottom-6 left-4 right-4 rounded-2xl border border-border bg-card/95 p-4 shadow-soft backdrop-blur sm:left-8 sm:right-auto sm:w-72">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Last verified bottle
              </p>
              <p className="mt-1 font-display text-lg font-semibold">HC-BATCH-2026-0198</p>
              <p className="text-xs text-muted-foreground">
                Mustard honey · Barabanki, Uttar Pradesh
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Verify */}
      <section id="verify" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold sm:text-4xl">Verify your honey</h2>
          <p className="mt-3 text-muted-foreground">
            Scan the QR on the label, or scratch the silver panel on the cap and enter the 12
            character code.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,26rem)_1fr]">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <div className="relative grid aspect-square place-items-center overflow-hidden rounded-2xl bg-secondary">
              <div className="absolute inset-8 rounded-xl border-2 border-dashed border-honey/70" />
              {[
                "left-6 top-6 border-l-4 border-t-4 rounded-tl-xl",
                "right-6 top-6 border-r-4 border-t-4 rounded-tr-xl",
                "left-6 bottom-6 border-b-4 border-l-4 rounded-bl-xl",
                "right-6 bottom-6 border-b-4 border-r-4 rounded-br-xl",
              ].map((pos) => (
                <span key={pos} className={`absolute size-10 border-honey-deep ${pos}`} />
              ))}
              {scanning && (
                <span className="absolute inset-x-10 top-10 h-0.5 animate-bounce bg-honey-deep shadow-glow" />
              )}
              <div className="text-center">
                <QrIcon className="mx-auto size-16 text-honey-deep" strokeWidth={1.4} />
                <p className="mt-3 text-sm font-medium text-muted-foreground">
                  {scanning ? "Reading label…" : "Point camera at the QR label"}
                </p>
              </div>
            </div>
            <Button onClick={simulateScan} className="mt-5 w-full rounded-xl" disabled={scanning}>
              <ScanLine className="size-4.5" /> {scanning ? "Scanning…" : "Simulate QR scan"}
            </Button>

            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                or
              </span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                verify(code);
              }}
              className="space-y-3"
            >
              <label htmlFor="scratch" className="text-sm font-medium">
                Scratch code
              </label>
              <Input
                id="scratch"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="HNY7-4KQ2-9XTM"
                className="h-12 text-center font-mono text-base tracking-widest"
              />
              <Button type="submit" variant="secondary" className="w-full rounded-xl">
                <Search className="size-4.5" /> Verify
              </Button>
            </form>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
            {result ? (
              <div>
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-5">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-leaf-soft px-3 py-1 text-xs font-semibold text-leaf">
                      <BadgeCheck className="size-3.5" /> Authentic KVIC honey
                    </span>
                    <h3 className="mt-2 font-display text-2xl font-semibold">{result.id}</h3>
                    <p className="text-sm text-muted-foreground">
                      {result.floralSource} honey · {result.harvestKg} kg batch · {result.location}
                    </p>
                  </div>
                  <StatusBadge stage={result.status} />
                </div>

                <dl className="grid gap-4 border-b border-border py-5 sm:grid-cols-3">
                  {[
                    ["Beekeeper", result.beekeeperName],
                    ["Hive", result.hiveId],
                    ["Retail partner", result.storeOwner ?? "In transit"],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{k}</dt>
                      <dd className="mt-0.5 text-sm font-semibold">{v}</dd>
                    </div>
                  ))}
                </dl>

                <h4 className="mb-5 mt-6 font-display text-lg font-semibold">
                  Blockchain traceability
                </h4>
                <TraceTimeline batch={result} />
              </div>
            ) : (
              <div className="grid h-full min-h-72 place-items-center text-center">
                <div>
                  <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-honey-soft">
                    <Hexagon className="size-8 text-honey-deep" strokeWidth={1.6} />
                  </span>
                  <p className="mt-4 font-display text-xl font-semibold">
                    Your honey&apos;s journey appears here
                  </p>
                  <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                    Scan or enter a scratch code to reveal harvest, extraction, packing, dispatch
                    and retail records — each one written to the chain.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-secondary/50 py-8">
        <div className="mx-auto max-w-7xl px-4 text-sm text-muted-foreground sm:px-6">
          Honey Chain · A prototype for Khadi & Village Industries Commission · Smart India
          Hackathon 26021
        </div>
      </footer>

      <ChatWidget />
    </main>
  );
}
