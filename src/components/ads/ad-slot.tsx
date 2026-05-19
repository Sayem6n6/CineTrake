import { areAdsEnabledForCurrentUser } from "@/lib/ads";
import { cn } from "@/lib/utils";

export async function AdSlot({
  label = "Ad placement",
  size = "banner",
  className,
}: {
  label?: string;
  size?: "banner" | "sidebar" | "inline";
  className?: string;
}) {
  const adsEnabled = await areAdsEnabledForCurrentUser();

  if (!adsEnabled) return null;

  return (
    <div
      className={cn(
        "grid place-items-center rounded-lg border border-dashed bg-card/70 text-center shadow-sm",
        size === "banner" && "min-h-24 px-4",
        size === "sidebar" && "min-h-72 px-5",
        size === "inline" && "min-h-32 px-4",
        className,
      )}
    >
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          728x90 / responsive sponsor slot
        </p>
      </div>
    </div>
  );
}
