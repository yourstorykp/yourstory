import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  const { db } = await import("@/lib/db");
  const { bookings, bookingStatusLog } = await import("@/db/schema");
  const { sql } = await import("drizzle-orm");

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS booking_status_log (
      id SERIAL PRIMARY KEY,
      booking_id INTEGER REFERENCES bookings(id),
      status TEXT NOT NULL,
      note TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT now()
    );
  `);

  const rows = await db.select().from(bookings);
  let backfilled = 0;
  for (const b of rows) {
    const existing = await db
      .select()
      .from(bookingStatusLog)
      .where(sql`${bookingStatusLog.bookingId} = ${b.id}`)
      .limit(1);
    if (existing.length === 0) {
      await db.insert(bookingStatusLog).values({
        bookingId: b.id,
        status: b.status,
        note: "backfill otomatis",
      });
      backfilled += 1;
    }
  }

  console.log(
    `Table ready. Bookings: ${rows.length}, backfilled log: ${backfilled}`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
