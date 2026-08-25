import { db } from "@/lib/db";
import { categories, consignors } from "@/db/schema";
import { ItemForm } from "@/components/admin/item-form";
import { createItemAction } from "../../actions";

export default async function NewItemPage() {
  const [cats, cons] = await Promise.all([
    db.select({ id: categories.id, name: categories.name }).from(categories),
    db.select({ id: consignors.id, name: consignors.name }).from(consignors),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="font-heading text-2xl font-semibold">Tambah Barang</h1>
      <ItemForm action={createItemAction} categories={cats} consignors={cons} />
    </div>
  );
}
