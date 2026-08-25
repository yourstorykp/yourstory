import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { items, categories } from "@/db/schema";
import { desc } from "drizzle-orm";
import { CatalogClient, type CatalogItem } from "@/components/sewa/catalog-client";

export const revalidate = 120;

const getCatalogData = unstable_cache(
  async () => {
    const [cats, rows] = await Promise.all([
      db.select().from(categories).orderBy(categories.name),
      db.query.items.findMany({
        with: { category: true },
        orderBy: [desc(items.createdAt)],
      }),
    ]);
    return { cats, rows };
  },
  ["sewa-catalog-all"],
  { revalidate: 120, tags: ["catalog", "items"] },
);

export default async function SewaPage() {
  const { cats, rows } = await getCatalogData();

  return <CatalogClient items={rows as CatalogItem[]} categories={cats} />;
}
