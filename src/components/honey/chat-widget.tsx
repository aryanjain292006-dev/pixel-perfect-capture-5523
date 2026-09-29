import { MessageCircle, Send, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Msg = { from: "bot" | "user"; text: string };

const CANNED = [
  "Your hive weight is rising steadily — expect a harvest window in about 9 days.",
  "For a sudden temperature rise, add shade netting and widen the hive entrance today.",
  "Scratch codes are printed under the silver panel on the bottle cap. Enter all 12 characters.",
  "KVIC bee box subsidy claims are filed by your block officer once 3 harvests are recorded.",
];

const SUGGESTIONS = [
  "When should I harvest?",
  "Hive 03 is too hot",
  "Where is my scratch code?",
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    { from: "bot", text: "Namaste! I am Madhu, your beekeeping assistant. Ask me anything." },
  ]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const reply = CANNED[msgs.filter((m) => m.from === "user").length % CANNED.length];
    setMsgs((prev) => [...prev, { from: "user", text }, { from: "bot", text: reply }]);
    setInput("");
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex h-[26rem] w-[min(21rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-glow">
          <div className="flex items-center gap-3 bg-gradient-honey px-4 py-3">
            <span className="grid size-8 place-items-center rounded-full bg-card/85 text-sm font-bold text-honey-deep">
              M
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-primary-foreground">Madhu Assistant</p>
              <p className="text-[11px] text-primary-foreground/80">Hindi · English · Marathi</p>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {msgs.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm",
                  m.from === "bot"
                    ? "bg-secondary text-secondary-foreground"
                    : "ml-auto bg-gradient-honey text-primary-foreground",
                )}
              >
                {m.text}
              </div>
            ))}
            <div className="flex flex-wrap gap-2 pt-1">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-honey-soft hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <form
            className="flex items-center gap-2 border-t border-border p-3"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question…"
              className="h-10"
            />
            <Button type="submit" size="icon" className="size-10 shrink-0">
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open assistant"
        className="grid size-14 place-items-center rounded-full bg-gradient-honey shadow-glow transition-transform hover:scale-105 active:scale-95"
      >
        {open ? (
          <X className="size-6 text-primary-foreground" />
        ) : (
          <MessageCircle className="size-6 text-primary-foreground" />
        )}
      </button>
    </div>
  );
}
