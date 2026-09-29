import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Stage = "harvested" | "extracted" | "packed" | "dispatched" | "available";

export const STAGE_ORDER: Stage[] = [
  "harvested",
  "extracted",
  "packed",
  "dispatched",
  "available",
];

export const STAGE_LABEL: Record<Stage, string> = {
  harvested: "Harvested",
  extracted: "Extracted",
  packed: "Packed",
  dispatched: "Dispatched",
  available: "Available for Sale",
};

export type TraceEvent = {
  stage: Stage;
  timestamp: string;
  hash: string;
  actor: string;
  note: string;
};

export type Batch = {
  id: string;
  beekeeperId: string;
  beekeeperName: string;
  hiveId: string;
  location: string;
  harvestKg: number;
  floralSource: string;
  scratchCode: string;
  status: Stage;
  storeOwner?: string;
  events: TraceEvent[];
};

export type Beekeeper = {
  id: string;
  name: string;
  village: string;
  state: string;
  boxes: number;
  honeyKg: number;
  status: "Active" | "Training" | "Onboarded";
  joined: string;
  password?: string;
};

export type Hive = {
  id: string;
  label: string;
  temperature: number;
  humidity: number;
  weight: number;
  health: "Healthy" | "Watch" | "Critical";
  yieldForecast: number;
  series: { time: string; temperature: number; humidity: number; weight: number }[];
};

const FLORAL = ["Mustard", "Litchi", "Eucalyptus", "Multiflora", "Jamun"];

function randomHash() {
  const chars = "0123456789abcdef";
  let out = "0x";
  for (let i = 0; i < 40; i += 1) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function scratch() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 12; i += 1) {
    if (i > 0 && i % 4 === 0) out += "-";
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function stamp(daysAgo: number, hour = 9) {
  const d = new Date(Date.UTC(2026, 8, 29, hour, 24));
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString();
}

export function formatStamp(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildSeries(base: { t: number; h: number; w: number }) {
  return Array.from({ length: 12 }, (_, i) => {
    const hour = `${String(i * 2).padStart(2, "0")}:00`;
    return {
      time: hour,
      temperature: +(base.t + Math.sin(i / 1.8) * 1.9 + (i > 9 ? 1.4 : 0)).toFixed(1),
      humidity: +(base.h + Math.cos(i / 2.2) * 4).toFixed(1),
      weight: +(base.w + i * 0.32).toFixed(2),
    };
  });
}

const INITIAL_HIVES: Hive[] = [
  {
    id: "HIVE-01",
    label: "Hive 01 · Sunflower Block",
    temperature: 34.2,
    humidity: 58,
    weight: 41.8,
    health: "Healthy",
    yieldForecast: 18.4,
    series: buildSeries({ t: 34, h: 58, w: 38 }),
  },
  {
    id: "HIVE-02",
    label: "Hive 02 · Mustard Field",
    temperature: 33.1,
    humidity: 62,
    weight: 37.4,
    health: "Watch",
    yieldForecast: 14.1,
    series: buildSeries({ t: 33, h: 62, w: 34 }),
  },
  {
    id: "HIVE-03",
    label: "Hive 03 · Orchard Edge",
    temperature: 39.6,
    humidity: 47,
    weight: 29.2,
    health: "Critical",
    yieldForecast: 8.7,
    series: buildSeries({ t: 37, h: 48, w: 27 }),
  },
  {
    id: "HIVE-04",
    label: "Hive 04 · Riverside",
    temperature: 32.8,
    humidity: 65,
    weight: 44.6,
    health: "Healthy",
    yieldForecast: 21.2,
    series: buildSeries({ t: 32.5, h: 65, w: 41 }),
  },
];

const INITIAL_BEEKEEPERS: Beekeeper[] = [
  {
    id: "KVIC-BK-1042",
    name: "Ramesh Yadav",
    village: "Barabanki",
    state: "Uttar Pradesh",
    boxes: 24,
    honeyKg: 412,
    status: "Active",
    joined: stamp(212),
  },
  {
    id: "KVIC-BK-1043",
    name: "Lakshmi Devi",
    village: "Muzaffarpur",
    state: "Bihar",
    boxes: 18,
    honeyKg: 268,
    status: "Active",
    joined: stamp(180),
  },
  {
    id: "KVIC-BK-1044",
    name: "Gurpreet Singh",
    village: "Hoshiarpur",
    state: "Punjab",
    boxes: 40,
    honeyKg: 716,
    status: "Active",
    joined: stamp(150),
  },
  {
    id: "KVIC-BK-1045",
    name: "Anita Pawar",
    village: "Satara",
    state: "Maharashtra",
    boxes: 12,
    honeyKg: 96,
    status: "Training",
    joined: stamp(38),
  },
  {
    id: "KVIC-BK-1046",
    name: "Bhaskar Nath",
    village: "Nagaon",
    state: "Assam",
    boxes: 16,
    honeyKg: 184,
    status: "Onboarded",
    joined: stamp(12),
  },
];

function eventsUpTo(status: Stage, actor: string, base: number): TraceEvent[] {
  const idx = STAGE_ORDER.indexOf(status);
  const notes: Record<Stage, string> = {
    harvested: "Frames harvested and weighed at apiary",
    extracted: "Cold extraction completed, moisture 17.2%",
    packed: "Bottled, QR label + scratch code issued",
    dispatched: "Handed to logistics for store delivery",
    available: "Store confirmed receipt, listed for sale",
  };
  return STAGE_ORDER.slice(0, idx + 1).map((stage, i) => ({
    stage,
    timestamp: stamp(base - i * 2, 8 + i * 2),
    hash: randomHash(),
    actor: i >= 3 ? "Madhu Mart, Lucknow" : actor,
    note: notes[stage],
  }));
}

const INITIAL_BATCHES: Batch[] = [
  {
    id: "HC-BATCH-2026-0198",
    beekeeperId: "KVIC-BK-1042",
    beekeeperName: "Ramesh Yadav",
    hiveId: "HIVE-01",
    location: "Barabanki, Uttar Pradesh",
    harvestKg: 24.5,
    floralSource: "Mustard",
    scratchCode: "HNY7-4KQ2-9XTM",
    status: "available",
    storeOwner: "Madhu Mart, Lucknow",
    events: eventsUpTo("available", "Ramesh Yadav", 14),
  },
  {
    id: "HC-BATCH-2026-0203",
    beekeeperId: "KVIC-BK-1043",
    beekeeperName: "Lakshmi Devi",
    hiveId: "HIVE-02",
    location: "Muzaffarpur, Bihar",
    harvestKg: 18.2,
    floralSource: "Litchi",
    scratchCode: "LTC5-8PDR-2WQH",
    status: "dispatched",
    storeOwner: "Madhu Mart, Lucknow",
    events: eventsUpTo("dispatched", "Lakshmi Devi", 8),
  },
  {
    id: "HC-BATCH-2026-0211",
    beekeeperId: "KVIC-BK-1044",
    beekeeperName: "Gurpreet Singh",
    hiveId: "HIVE-04",
    location: "Hoshiarpur, Punjab",
    harvestKg: 31.6,
    floralSource: "Eucalyptus",
    scratchCode: "EUC3-6MNB-5JZK",
    status: "packed",
    events: eventsUpTo("packed", "Gurpreet Singh", 5),
  },
  {
    id: "HC-BATCH-2026-0216",
    beekeeperId: "KVIC-BK-1042",
    beekeeperName: "Ramesh Yadav",
    hiveId: "HIVE-03",
    location: "Barabanki, Uttar Pradesh",
    harvestKg: 12.4,
    floralSource: "Multiflora",
    scratchCode: "MFL9-2QWE-7HGT",
    status: "harvested",
    events: eventsUpTo("harvested", "Ramesh Yadav", 2),
  },
];

export const STORES = ["Madhu Mart, Lucknow", "KVIC Outlet, Patna", "Honey House, Pune"];

type Ctx = {
  batches: Batch[];
  beekeepers: Beekeeper[];
  hives: Hive[];
  addBeekeeper: (input: { name: string; village: string; state: string; boxes: number }) => Beekeeper;
  recordHarvest: (input: {
    beekeeperId: string;
    hiveId: string;
    location: string;
    harvestKg: number;
    floralSource?: string;
  }) => Batch;
  advance: (batchId: string, stage: Stage, actor?: string) => void;
  dispatchBatch: (batchId: string, store: string) => void;
  findByCode: (code: string) => Batch | undefined;
};

const HoneyContext = createContext<Ctx | null>(null);

export function HoneyProvider({ children }: { children: ReactNode }) {
  const [batches, setBatches] = useState<Batch[]>(INITIAL_BATCHES);
  const [beekeepers, setBeekeepers] = useState<Beekeeper[]>(INITIAL_BEEKEEPERS);
  const [hives] = useState<Hive[]>(INITIAL_HIVES);

  const addBeekeeper: Ctx["addBeekeeper"] = useCallback((input) => {
    const next: Beekeeper = {
      id: `KVIC-BK-${1047 + Math.floor(Math.random() * 900)}`,
      name: input.name,
      village: input.village,
      state: input.state,
      boxes: input.boxes,
      honeyKg: 0,
      status: "Onboarded",
      joined: new Date().toISOString(),
      password: scratch().replace(/-/g, "").slice(0, 8).toLowerCase(),
    };
    setBeekeepers((prev) => [next, ...prev]);
    return next;
  }, []);

  const recordHarvest: Ctx["recordHarvest"] = useCallback(
    (input) => {
      const keeper = beekeepers.find((b) => b.id === input.beekeeperId) ?? beekeepers[0]!;
      const batch: Batch = {
        id: `HC-BATCH-2026-0${220 + Math.floor(Math.random() * 79)}`,
        beekeeperId: keeper.id,
        beekeeperName: keeper.name,
        hiveId: input.hiveId,
        location: input.location,
        harvestKg: input.harvestKg,
        floralSource: input.floralSource ?? FLORAL[Math.floor(Math.random() * FLORAL.length)]!,
        scratchCode: scratch(),
        status: "harvested",
        events: [
          {
            stage: "harvested",
            timestamp: new Date().toISOString(),
            hash: randomHash(),
            actor: keeper.name,
            note: `Harvest of ${input.harvestKg} kg recorded from ${input.hiveId}`,
          },
        ],
      };
      setBatches((prev) => [batch, ...prev]);
      return batch;
    },
    [beekeepers],
  );

  const advance: Ctx["advance"] = useCallback((batchId, stage, actor) => {
    setBatches((prev) =>
      prev.map((b) => {
        if (b.id !== batchId) return b;
        if (b.events.some((e) => e.stage === stage)) return b;
        const notes: Record<Stage, string> = {
          harvested: "Harvest recorded on chain",
          extracted: "Cold extraction completed, moisture verified",
          packed: "Bottled, QR label + scratch code issued",
          dispatched: "Transferred to store owner custody",
          available: "Receipt confirmed, listed for consumer sale",
        };
        return {
          ...b,
          status: stage,
          events: [
            ...b.events,
            {
              stage,
              timestamp: new Date().toISOString(),
              hash: randomHash(),
              actor: actor ?? b.beekeeperName,
              note: notes[stage],
            },
          ],
        };
      }),
    );
  }, []);

  const dispatchBatch: Ctx["dispatchBatch"] = useCallback(
    (batchId, store) => {
      setBatches((prev) => prev.map((b) => (b.id === batchId ? { ...b, storeOwner: store } : b)));
      advance(batchId, "dispatched", store);
    },
    [advance],
  );

  const findByCode: Ctx["findByCode"] = useCallback(
    (code) => {
      const norm = code.trim().toUpperCase().replace(/\s/g, "");
      if (!norm) return undefined;
      return batches.find(
        (b) =>
          b.scratchCode.replace(/-/g, "") === norm.replace(/-/g, "") ||
          b.id.toUpperCase() === norm,
      );
    },
    [batches],
  );

  const value = useMemo(
    () => ({
      batches,
      beekeepers,
      hives,
      addBeekeeper,
      recordHarvest,
      advance,
      dispatchBatch,
      findByCode,
    }),
    [batches, beekeepers, hives, addBeekeeper, recordHarvest, advance, dispatchBatch, findByCode],
  );

  return <HoneyContext.Provider value={value}>{children}</HoneyContext.Provider>;
}

export function useHoney() {
  const ctx = useContext(HoneyContext);
  if (!ctx) throw new Error("useHoney must be used inside HoneyProvider");
  return ctx;
}
