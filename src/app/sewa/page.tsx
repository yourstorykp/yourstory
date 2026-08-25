import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { items, categories, settings } from "@/db/schema";
import { desc } from "drizzle-orm";
import { CatalogClient, type CatalogItem } from "@/components/sewa/catalog-client";

export const revalidate = 120;

const getCatalogData = unstable_cache(
  async () => {
    const [cats, rows, s] = await Promise.all([
      db.select().from(categories).orderBy(categories.name),
      db.query.items.findMany({
        with: { category: true, consignor: true },
        orderBy: [desc(items.createdAt)],
      }),
      db.select().from(settings).limit(1),
    ]);
    const dpPct = Number(s[0]?.defaultDpPct ?? 30);
    return { cats, rows, dpPct };
  },
  ["sewa-catalog-all"],
  { revalidate: 120, tags: ["catalog", "items"] },
);

export default async function SewaPage() {
  const { cats, rows, dpPct } = await getCatalogData();

  return (
    <CatalogClient
      items={rows as CatalogItem[]}
      categories={cats}
      dpPct={dpPct}
    />
  );
}
