import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  const { createBooking } = await import("../src/lib/booking");
  const res = await createBooking({
    itemId: 1,
    name: "Test Penyewa",
    contact: "081234567890",
    email: "test@example.com",
    startDate: "2026-09-01",
    endDate: "2026-09-03",
    qty: 1,
    notes: "verifikasi script",
  });
  console.log("BOOKING OK:", JSON.stringify(res));
}

main().catch((e) => {
  console.error("BOOKING FAIL:", e?.message ?? e);
  process.exit(1);
});
