import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  const { db } = await import("../src/lib/db");
  const { items, categories } = await import("../src/db/schema");

  const cats = await db.select().from(categories);
  if (cats.length === 0) {
    console.log("Belum ada kategori. Jalankan `npm run seed` dulu.");
    process.exit(0);
  }
  const byName = Object.fromEntries(cats.map((c) => [c.name, c.id]));

  const existing = await db.select().from(items);
  if (existing.length > 0) {
    console.log(`Sudah ada ${existing.length} barang, lewati seed contoh.`);
    process.exit(0);
  }

  const samples: Record<string, Record<string, unknown>[]> = {
    Kamera: [
      {
        name: "Canon EOS M50 Mark II",
        sku: "CAM-M50",
        description:
          "Mirrorless 24.1MP dengan kit lensa 15-45mm. Cocok untuk vlog & fotografi travel.",
        hargaSewa: "120000",
        satuanSewa: "hari",
        stokTotal: 3,
        maintenanceDays: 1,
        notes: "Termasuk 2 baterai & 1 memory card 32GB.",
      },
      {
        name: "Sony ZV-E10",
        sku: "CAM-ZVE10",
        description: "Kamera vlog ringan dengan mic eksternal, ideal untuk konten kreator.",
        hargaSewa: "110000",
        satuanSewa: "hari",
        stokTotal: 2,
        maintenanceDays: 1,
      },
      {
        name: "Tripod Aluminum 1.8m",
        sku: "TRI-180",
        description: "Tripod kokoh untuk kamera & mirrorless, head fluid.",
        hargaSewa: "35000",
        satuanSewa: "hari",
        stokTotal: 5,
        maintenanceDays: 0,
      },
    ],
    Outdoor: [
      {
        name: "Tenda Dome 4 Orang",
        sku: "TEN-D4",
        description: "Tenda kemah dome waterproof, muat 4 orang. Ringan & mudah dipasang.",
        hargaSewa: "85000",
        satuanSewa: "hari",
        stokTotal: 4,
        maintenanceDays: 1,
        notes: "Free alas tenda.",
      },
      {
        name: "Sleeping Bag -5C",
        sku: "SLP-B5",
        description: "Sleeping bag hangat hingga -5°C, kompak untuk hiking.",
        hargaSewa: "40000",
        satuanSewa: "hari",
        stokTotal: 6,
        maintenanceDays: 0,
      },
      {
        name: "Kompor Portable Camping",
        sku: "KOM-P1",
        description: "Kompor gas portable kecil, termasuk 1 tabung gas.",
        hargaSewa: "30000",
        satuanSewa: "hari",
        stokTotal: 5,
        maintenanceDays: 0,
      },
    ],
  };

  for (const [catName, list] of Object.entries(samples)) {
    const catId = byName[catName];
    if (!catId) continue;
    for (const it of list) {
      await db
        .insert(items)
        .values({ ...(it as any), categoryId: catId, ownerType: "store" });
    }
  }

  console.log("Contoh barang berhasil ditambahkan ke katalog.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
