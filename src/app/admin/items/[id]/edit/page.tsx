import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { items, categories, consignors } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ItemForm } from "@/components/admin/item-form";
import { updateItemAction } from "../../../actions";

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const itemId = Number(id);
  if (isNaN(itemId)) notFound();

  const [item, cats, cons] = await Promise.all([
    db.select().from(items).where(eq(items.id, itemId)).limit(1),
    db.select({ id: categories.id, name: categories.name }).from(categories),
    db.select({ id: consignors.id, name: consignors.name }).from(consignors),
  ]);

  if (item.length === 0) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="font-heading text-2xl font-semibold">Edit Barang</h1>
      <ItemForm
        action={updateItemAction}
        categories={cats}
        consignors={cons}
        item={item[0]}
      />
    </div>
  );
}
