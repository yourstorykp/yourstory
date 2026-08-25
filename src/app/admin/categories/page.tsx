import Link from "next/link";
import { db } from "@/lib/db";
import { categories, items } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteButton } from "@/components/admin/delete-button";
import { CategoryForm } from "@/components/admin/category-form";
import { createCategoryAction, deleteCategoryAction } from "../actions";

export default async function CategoriesPage() {
  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      description: categories.description,
      count: sql<number>`cast(count(${items.id}) as int)`,
    })
    .from(categories)
    .leftJoin(items, eq(items.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(desc(categories.createdAt));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Kategori</h1>
          <p className="text-sm text-muted-foreground">Kelompokkan barang rental.</p>
        </div>
        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Jml Barang</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="py-10 text-center text-muted-foreground">
                    Belum ada kategori.
                  </TableCell>
                </TableRow>
              )}
              {rows.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">{c.count}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button render={<Link href={`/admin/categories/${c.id}/edit`} />} variant="ghost" size="sm">
                        Edit
                      </Button>
                      <DeleteButton action={deleteCategoryAction.bind(null, c.id)} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="font-heading text-xl font-semibold">Tambah Kategori</h2>
        <CategoryForm action={createCategoryAction} title="Kategori Baru" />
      </div>
    </div>
  );
}
