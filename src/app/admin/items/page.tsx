import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { items } from "@/db/schema";
import { desc, count } from "drizzle-orm";
import { PaginationControls } from "@/components/admin/pagination-controls";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteItemAction } from "../actions";
import { formatRupiah } from "@/lib/format";

export default async function ItemsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, Number(pageStr) || 1);
  const pageSize = 20;

  const [[totalCount], rows] = await Promise.all([
    db.select({ v: count() }).from(items),
    db.query.items.findMany({
      with: { category: true, consignor: true },
      orderBy: [desc(items.createdAt)],
      limit: pageSize,
      offset: (page - 1) * pageSize,
    })
  ]);
  const totalPages = Math.ceil(totalCount.v / pageSize);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Inventaris</h1>
          <p className="text-sm text-muted-foreground">
            Kelola barang, stok, dan kepemilikan (titipan).
          </p>
        </div>
        <div className="flex gap-2">
          <Button render={<Link href="/admin/categories" />} variant="outline">
            + Tambah Kategori
          </Button>
          <Button render={<Link href="/admin/items/new" />} className="bg-forest hover:bg-forest-deep">
            + Tambah Produk
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead>Stok</TableHead>
              <TableHead>Maint.</TableHead>
              <TableHead>Kepemilikan</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  Belum ada barang. Klik &quot;+ Tambah Barang&quot; untuk mulai.
                </TableCell>
              </TableRow>
            )}
            {rows.map((it) => (
              <TableRow key={it.id}>
                <TableCell className="font-medium">{it.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {it.category?.name ?? "—"}
                </TableCell>
                <TableCell>{formatRupiah(it.hargaSewa)}</TableCell>
                <TableCell>{it.stokTotal}</TableCell>
                <TableCell>{it.maintenanceDays} hri</TableCell>
                <TableCell>
                  {it.ownerType === "consignor" ? (
                    <Badge variant="secondary" className="bg-terracotta/15 text-terracotta-deep">
                      Titipan · {it.consignor?.name ?? "?"}
                    </Badge>
                  ) : (
                    <Badge variant="outline">Milik Toko</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button render={<Link href={`/admin/items/${it.id}/edit`} />} variant="ghost" size="sm">
                      Edit
                    </Button>
                    <DeleteButton action={deleteItemAction.bind(null, it.id)} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <PaginationControls page={page} totalPages={totalPages} baseUrl="/admin/items" />
      </div>
    </div>
  );
}
