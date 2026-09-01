import fs from "fs";

const file = "src/app/admin/bookings/page.tsx";
let code = fs.readFileSync(file, "utf8");

code = code.replace(
  `import { desc, ne } from "drizzle-orm";`,
  `import { desc, ne, count } from "drizzle-orm";\nimport { PaginationControls } from "@/components/admin/pagination-controls";`
);

const oldFunc = `export default async function BookingsPage() {
  const rows = await db.query.bookings.findMany({
    where: ne(bookings.status, "completed"),
    with: { customer: true, items: { with: { item: true } } },
    orderBy: [desc(bookings.createdAt)],
  });`;

const newFunc = `export default async function BookingsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, Number(pageStr) || 1);
  const pageSize = 15;

  const [[totalCount], rows] = await Promise.all([
    db.select({ v: count() }).from(bookings).where(ne(bookings.status, "completed")),
    db.query.bookings.findMany({
      where: ne(bookings.status, "completed"),
      with: { customer: true, items: { with: { item: true } } },
      orderBy: [desc(bookings.createdAt)],
      limit: pageSize,
      offset: (page - 1) * pageSize,
    })
  ]);
  const totalPages = Math.ceil(totalCount.v / pageSize);`;

code = code.replace(oldFunc, newFunc);

code = code.replace(
  `      <BookingsList rows={data} />
    </div>`,
  `      <BookingsList rows={data} />
      <PaginationControls page={page} totalPages={totalPages} baseUrl="/admin/bookings" />
    </div>`
);

fs.writeFileSync(file, code);
