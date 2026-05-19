import Image from "next/image";
import Link from "next/link";
import { LogOut, Menu, Sparkles } from "lucide-react";
import { logout } from "@/app/(auth)/actions";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link className="flex items-center gap-2" href="/" aria-label="CineTrake home">
          <Image
            src="/cinetrake-logo.png"
            alt="CineTrake"
            width={166}
            height={40}
            priority
            className="h-8 w-auto dark:invert"
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Button asChild variant="ghost">
            <Link href="/">Discover</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/blog">Blog</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <form action={logout}>
              <Button size="icon" variant="secondary" aria-label="Log out" title="Log out">
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <>
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">
                  <Sparkles className="h-4 w-4" />
                  Sign up
                </Link>
              </Button>
            </>
          )}
          <Button asChild className="md:hidden" size="icon" variant="secondary" aria-label="Menu">
            <Link href="/dashboard">
              <Menu className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
