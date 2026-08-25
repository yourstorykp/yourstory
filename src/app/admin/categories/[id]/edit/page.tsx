import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { CategoryForm } from "@/components/admin/category-form";
import { updateCategoryAction } from "../../../actions";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const catId = Number(id);
  if (isNaN(catId)) notFound();

  const c = await db.select().from(categories).where(eq(categories.id, catId)).limit(1);
  if (c.length === 0) notFound();

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="font-heading text-2xl font-semibold">Edit Kategori</h1>
      <CategoryForm
        action={updateCategoryAction}
        category={c[0]}
        categoryId={c[0].id}
        title="Perbarui Kategori"
      />
    </div>
  );
}
