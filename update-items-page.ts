import fs from "fs";

const file = "src/app/admin/items/page.tsx";
let code = fs.readFileSync(file, "utf8");

code = code.replace(
  `import { desc } from "drizzle-orm";`,
  `import { desc, count } from "drizzle-orm";\nimport { PaginationControls } from "@/components/admin/pagination-controls";`
);

const oldFunc = `export default async function ItemsPage() {
  const rows = await db.query.items.findMany({
    with: { category: true, consignor: true },
    orderBy: [desc(items.createdAt)],
  });`;

const newFunc = `export default async function ItemsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
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
  const totalPages = Math.ceil(totalCount.v / pageSize);`;

code = code.replace(oldFunc, newFunc);

code = code.replace(
  `        </Table>
      </div>`,
  `        </Table>
        <PaginationControls page={page} totalPages={totalPages} baseUrl="/admin/items" />
      </div>`
);

fs.writeFileSync(file, code);
