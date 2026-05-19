import Link from "next/link";
import { AdSlot } from "@/components/ads/ad-slot";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <AdSlot label="Footer ad" />
        <div className="mt-8 flex flex-col justify-between gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center">
          <p>CineTrake helps movie fans track upcoming releases.</p>
          <nav className="flex gap-4">
            <Link className="hover:text-foreground" href="/blog">
              Blog
            </Link>
            <Link className="hover:text-foreground" href="/dashboard">
              Dashboard
            </Link>
            <Link className="hover:text-foreground" href="/privacy">
              Privacy Policy
            </Link>
            <Link className="hover:text-foreground" href="/terms">
              Terms
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
