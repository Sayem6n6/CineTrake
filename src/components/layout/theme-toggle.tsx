"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const currentTheme = theme ?? "system";
  const nextTheme =
    currentTheme === "dark" ? "light" : currentTheme === "light" ? "system" : "dark";
  const Icon = currentTheme === "dark" ? Moon : currentTheme === "light" ? Sun : Monitor;

  return (
    <Button
      variant="secondary"
      size="icon"
      aria-label={`Switch theme to ${nextTheme}`}
      title={`Switch theme to ${nextTheme}`}
      onClick={() => setTheme(nextTheme)}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}
