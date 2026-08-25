import Link from "next/link";
import { db } from "@/lib/db";
import { items, categories, consignors, settings } from "@/db/schema";
import { count } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminDashboard() {
  const [itemCount, catCount, consCount, s] = await Promise.all([
    db.select({ v: count() }).from(items),
    db.select({ v: count() }).from(categories),
    db.select({ v: count() }).from(consignors),
    db.select().from(settings).limit(1),
  ]);

  const storeName = s[0]?.storeName ?? "yourstory.kp";

  const kpis = [
    { label: "Total Barang", value: itemCount[0]?.v ?? 0 },
    { label: "Kategori", value: catCount[0]?.v ?? 0 },
    { label: "Pemilik Titipan", value: consCount[0]?.v ?? 0 },
  ];

  return (
    <div className="space-y-6 topo-bg rounded-2xl border border-border bg-card/60 p-6">
      <div>
        <p className="text-sm text-muted-foreground">Selamat datang di</p>
        <h1 className="font-heading text-3xl font-semibold text-forest-deep">
          {storeName}
        </h1>
        <p className="mt-1 max-w-prose text-muted-foreground">
          Kelola inventaris rental & barang titipan dari satu dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {kpis.map((k) => (
          <Card key={k.label} className="border-border">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">{k.label}</p>
              <p className="font-heading text-3xl font-semibold text-forest">
                {k.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button render={<Link href="/admin/items/new" />} className="bg-forest hover:bg-forest-deep">
          + Tambah Barang
        </Button>
        <Button render={<Link href="/admin/items" />} variant="outline">
          Lihat Inventaris
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Fitur berikutnya: booking pelanggan, status sewa otomatis, & dashboard
        consignor bagi hasil.
      </p>
    </div>
  );
}
