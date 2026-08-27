import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { AdminNav } from "@/components/admin/admin-nav";
import { AdminMobileNav } from "@/components/admin/mobile-nav";
import { LogoutButton } from "@/components/admin/logout-button";
import { db } from "@/lib/db";
import { settings } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, s] = await Promise.all([
    auth(),
    db.select().from(settings).limit(1),
  ]);
  if (!session || (session.user as { role?: string }).role !== "admin") {
    redirect("/admin/login");
  }
  const storeName = s[0]?.storeName ?? "yourstory.kp";

  return (
    <div className="topo-bg flex min-h-screen flex-col">
      <header className="border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <AdminMobileNav storeName={storeName} />
            <Link href="/admin">
              <Logo />
            </Link>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">{storeName}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6">
        <aside className="hidden w-56 shrink-0 md:block">
          <AdminNav />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
