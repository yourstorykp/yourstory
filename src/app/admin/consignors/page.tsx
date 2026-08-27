import { db } from "@/lib/db";
import { consignors } from "@/db/schema";
import { desc } from "drizzle-orm";
import { ConsignorForm } from "@/components/admin/consignor-form";
import { createConsignorAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function ConsignorsPage() {
  const rows = await db
    .select({
      id: consignors.id,
      name: consignors.name,
      email: consignors.email,
      contact: consignors.contact,
    })
    .from(consignors)
    .orderBy(desc(consignors.id));

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-semibold">Pemilik Titipan</h1>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 font-heading text-lg font-semibold">Tambah Pemilik Titipan</h2>
        <ConsignorForm action={createConsignorAction} />
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 font-heading text-lg font-semibold">Daftar Pemilik</h2>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada pemilik titipan.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-2 pr-4">Nama</th>
                  <th className="py-2 pr-4">Email / Username</th>
                  <th className="py-2 pr-4">Kontak</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-border/60">
                    <td className="py-2 pr-4 font-medium">{r.name}</td>
                    <td className="py-2 pr-4">{r.email}</td>
                    <td className="py-2 pr-4">{r.contact ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
