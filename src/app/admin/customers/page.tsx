import { db } from "@/lib/db";
import { customers } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toggleBlacklistAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const rows = await db
    .select()
    .from(customers)
    .orderBy(desc(customers.createdAt));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Pelanggan</h1>
        <p className="text-sm text-muted-foreground">
          Daftar penyewa &amp; status blacklist.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Nama</th>
                <th className="px-4 py-3 font-medium">Kontak</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    Belum ada pelanggan.
                  </td>
                </tr>
              )}
              {rows.map((c) => (
                <tr key={c.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.contact ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.email ?? "—"}</td>
                  <td className="px-4 py-3">
                    {c.blacklist ? (
                      <Badge variant="secondary" className="bg-red-100 text-red-700">
                        Blacklist
                      </Badge>
                    ) : (
                      <Badge variant="outline">Aktif</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form action={toggleBlacklistAction.bind(null, c.id)}>
                      <Button type="submit" size="sm" variant="outline">
                        {c.blacklist ? "Buka Blokir" : "Blacklist"}
                      </Button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
