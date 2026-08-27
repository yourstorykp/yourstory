import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { CartProvider } from "@/components/sewa/cart-context";
import { CartWidget } from "@/components/sewa/cart-drawer";

export default function SewaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="topo-bg flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 border-b border-border bg-card/85 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/sewa" className="inline-flex items-center gap-2">
              <Logo className="scale-90" />
            </Link>
          <nav className="flex items-center gap-2 text-sm">
            <Button render={<Link href="/sewa" />} variant="ghost" size="sm">
              Katalog
            </Button>
            <Button
              render={<Link href="/login" />}
              variant="outline"
              size="sm"
            >
              Login
            </Button>
          </nav>
          </div>
        </header>

        <main className="mx-w-6xl flex-1">{children}</main>

        <footer className="border-t border-border bg-card/60">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>yourstory.kp — Sewa alat outdoor & fotografi.</span>
            <span>Booking dikonfirmasi admin via WhatsApp.</span>
          </div>
        </footer>
      </div>
      <CartWidget />
    </CartProvider>
  );
}
