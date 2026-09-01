import fs from "fs";

const file = "src/app/admin/titip-sewa/page.tsx";
let code = fs.readFileSync(file, "utf8");

code = code.replace(
  `import { desc, eq, inArray } from "drizzle-orm";`,
  `import { desc, eq, inArray, and, gte, lte } from "drizzle-orm";`
);

const oldBlock = `    const itemIds = myItems.map((i) => i.id);
    const bis = itemIds.length
      ? await db.query.bookingItems.findMany({
          where: inArray(bookingItems.itemId, itemIds),
          with: { booking: true, item: true },
        })
      : [];
    rows = bis
      .filter((bi) => {
        const d = bi.booking?.startDate;
        if (!d) return false;
        const dt = new Date(d);
        return dt.getFullYear() === ay && dt.getMonth() + 1 === am;
      })
      .map((bi) => ({
        id: bi.id,
        name: bi.item?.name ?? null,
        startDate: bi.booking?.startDate ?? null,
        status: bi.booking?.status ?? null,
        subtotal: bi.subtotal,
        pct: Number(bi.item?.profitSharePct || 0),
        paid: !!bi.consignorPaid,
      }));`;

const newBlock = `    const itemIds = myItems.map((i) => i.id);
    
    if (itemIds.length) {
      const startOfMonth = \`\${ay}-\${String(am).padStart(2, "0")}-01\`;
      const endOfMonth = \`\${ay}-\${String(am).padStart(2, "0")}-31\`;
      
      const bis = await db.select({
        id: bookingItems.id,
        name: items.name,
        startDate: bookings.startDate,
        status: bookings.status,
        subtotal: bookingItems.subtotal,
        pct: items.profitSharePct,
        paid: bookingItems.consignorPaid,
      })
      .from(bookingItems)
      .innerJoin(bookings, eq(bookingItems.bookingId, bookings.id))
      .innerJoin(items, eq(bookingItems.itemId, items.id))
      .where(
        and(
          inArray(bookingItems.itemId, itemIds),
          gte(bookings.startDate, startOfMonth),
          lte(bookings.startDate, endOfMonth)
        )
      );
      
      rows = bis.map((bi) => ({
        id: bi.id,
        name: bi.name,
        startDate: bi.startDate,
        status: bi.status,
        subtotal: bi.subtotal,
        pct: Number(bi.pct || 0),
        paid: !!bi.paid,
      }));
    }`;

code = code.replace(oldBlock, newBlock);
fs.writeFileSync(file, code);
