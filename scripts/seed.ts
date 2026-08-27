import { config } from "dotenv";
config({ path: ".env.local" });

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { users, settings, categories, consignors, items } from "../src/db/schema";

function errText(e: unknown): string {
  const o = e as any;
  return [o?.message, o?.cause?.message, o?.cause?.cause?.message].filter(Boolean).join(" | ");
}

async function withRetry<T>(fn: () => Promise<T>, label: string, attempts = 6): Promise<T> {
  let lastErr: unknown;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn();
    } catch (e: any) {
      lastErr = e;
      const transient = /fetch failed|ECONNRESET|terminated|Timeout|ETIMEDOUT|getaddrinfo|ENOTFOUND/i.test(
        errText(e),
      );
      if (!transient || i === attempts) break;
      console.warn(`  (retry ${i}/${attempts}) ${label}: ${errText(e)}`);
      await new Promise((r) => setTimeout(r, 1000 * i));
    }
  }
  throw lastErr;
}

async function main() {
  const { db } = await import("../src/lib/db");
  const email = process.env.SEED_ADMIN_EMAIL || "admin@yourstory.kp";
  const password = process.env.SEED_ADMIN_PASSWORD || "admin1234";
  const hash = await bcrypt.hash(password, 10);

  await withRetry(async () => {
    const existing = await db.select().from(users).where(eq(users.email, email));
    if (existing.length === 0) {
      await db.insert(users).values({ name: "Admin yourstory.kp", email, passwordHash: hash });
      console.log(`Admin dibuat: ${email} / ${password}`);
    } else {
      await db.update(users).set({ passwordHash: hash }).where(eq(users.id, existing[0].id));
      console.log("Admin sudah ada, password diperbarui.");
    }
  }, "create admin");

  await withRetry(async () => {
    const s = await db.select().from(settings);
    if (s.length === 0) {
      await db.insert(settings).values({ storeName: "yourstory.kp" });
      console.log("Settings default dibuat.");
    }
  }, "create settings");

  await withRetry(async () => {
    const c = await db.select().from(categories);
    if (c.length === 0) {
      await db.insert(categories).values([
        { name: "Kamera", description: "Kamera & perlengkapan fotografi" },
        { name: "Outdoor", description: "Alat camping & outdoor" },
      ]);
      console.log("Kategori contoh dibuat.");
    }
  }, "create categories");

  await withRetry(async () => {
    const cEmail = "consignor@yourstory.kp";
    const consignorPassword = process.env.SEED_CONSIGNOR_PASSWORD || "consignor1234";
    const consignorHash = await bcrypt.hash(consignorPassword, 10);
    const existingC = await db.select().from(consignors).where(eq(consignors.email, cEmail));
    let cid: number;
    if (existingC.length === 0) {
      const [c] = await db
        .insert(consignors)
        .values({
          name: "Titipan Demo",
          email: cEmail,
          passwordHash: consignorHash,
          contact: "081999888777",
        })
        .returning({ id: consignors.id });
      cid = c.id;
      console.log(`Consignor dibuat: ${cEmail} / ${consignorPassword}`);
    } else {
      cid = existingC[0].id;
      await db.update(consignors).set({ passwordHash: consignorHash }).where(eq(consignors.id, cid));
      console.log("Consignor sudah ada, password diperbarui.");
    }
    const owned = await db
      .select()
      .from(items)
      .where(eq(items.ownerType, "store"))
      .limit(1);
    if (owned.length) {
      await db
        .update(items)
        .set({ ownerType: "consignor", consignorId: cid, profitSharePct: "20" })
        .where(eq(items.id, owned[0].id));
    }
  }, "create consignor");

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
