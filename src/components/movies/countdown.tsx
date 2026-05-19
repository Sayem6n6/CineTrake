"use client";

import { Clock3 } from "lucide-react";
import { useEffect, useState } from "react";
import { countdownLabel } from "@/lib/utils";

export function Countdown({ date, compact = false }: { date?: string | null; compact?: boolean }) {
  const [label, setLabel] = useState(countdownLabel(date));

  useEffect(() => {
    const update = () => setLabel(countdownLabel(date));
    update();
    const interval = window.setInterval(update, 60_000);

    return () => window.clearInterval(interval);
  }, [date]);

  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      <Clock3 className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
      {label}
    </span>
  );
}
