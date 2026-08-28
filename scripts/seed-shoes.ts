import { db } from "../src/lib/db";
import { items } from "../src/db/schema";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function run() {
  console.log("Inserting item into database...");
  try {
    await db.insert(items).values({
      name: "Sepatu Trekking Salomon Gore-Tex",
      description: "Sepatu gunung waterproof yang sangat tangguh untuk mendaki medan terjal. Grip maksimal dan anti air.",
      hargaSewa: "45000",
      satuanSewa: "hari",
      stokTotal: 3,
      maintenanceDays: 1,
      ownerType: "store",
      fotoUrl: "https://res.cloudinary.com/owtqegok/image/upload/v1787909311/yourstory/xohnwuayh4iyqo3wpdvc.jpg",
    });
    console.log("Done! Item added.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
