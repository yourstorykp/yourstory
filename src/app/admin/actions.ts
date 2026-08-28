"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { signOut } from "@/auth";
import { db } from "@/lib/db";
import { items, categories, settings, customers, consignors, bookingItems } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { parseNum, parseText } from "@/lib/format";
import { uploadBase64ToCloudinary } from "@/lib/cloudinary";

export interface ActionState {
  error?: string;
  success?: boolean;
}

export async function createItemAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const name = parseText(formData.get("name"));
  if (!name) return { error: "Nama barang wajib diisi." };

  let fotoUrl = null;
  const imageBase64 = parseText(formData.get("imageFileBase64"));
  if (imageBase64 && imageBase64.startsWith("data:image")) {
    try {
      fotoUrl = await uploadBase64ToCloudinary(imageBase64);
    } catch (err) {
      return { error: "Gagal mengunggah gambar ke Cloudinary." };
    }
  }

  try {
    await db.insert(items).values({
      categoryId: formData.get("categoryId") ? Number(formData.get("categoryId")) : null,
      name,
      sku: parseText(formData.get("sku")) || null,
      description: parseText(formData.get("description")) || null,
      hargaSewa: parseNum(formData.get("hargaSewa")),
      satuanSewa: parseText(formData.get("satuanSewa")) || "hari",
      stokTotal: Number(parseNum(formData.get("stokTotal"))) || 1,
      maintenanceDays: Number(parseNum(formData.get("maintenanceDays"))) || 0,
      ownerType: parseText(formData.get("ownerType")) || "store",
      consignorId: formData.get("consignorId")
        ? Number(formData.get("consignorId"))
        : null,
      profitSharePct: parseNum(formData.get("profitSharePct")),
      fotoUrl,
      notes: parseText(formData.get("notes")) || null,
    });
  } catch (e) {
    return { error: "Gagal menyimpan: " + (e as Error).message };
  }
  revalidatePath("/admin/items");
  revalidatePath("/");
  redirect("/admin/items");
}

export async function createConsignorAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const name = parseText(formData.get("name"));
  const email = parseText(formData.get("email"));
  const password = parseText(formData.get("password"));
  if (!name || !email || !password) {
    return { error: "Nama, email, dan password wajib diisi." };
  }
  try {
    const bcrypt = (await import("bcryptjs")).default;
    const passwordHash = await bcrypt.hash(password, 10);
    await db.insert(consignors).values({
      name,
      email,
      passwordHash,
      contact: parseText(formData.get("contact")) || null,
      notes: parseText(formData.get("notes")) || null,
    });
  } catch (e) {
    const msg = (e as Error).message;
    if (/duplicate|unique/i.test(msg)) return { error: "Email sudah terdaftar." };
    return { error: "Gagal menyimpan: " + msg };
  }
  revalidatePath("/admin/titip-sewa");
  revalidatePath("/admin/items/new");
  revalidatePath("/login/consignor");
  redirect("/admin/titip-sewa");
}

export async function updateBookingItemAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = Number(formData.get("id"));
  if (!id) return { error: "Data tidak valid." };
  try {
    await db
      .update(bookingItems)
      .set({ subtotal: parseNum(formData.get("subtotal")) })
      .where(eq(bookingItems.id, id));
  } catch (e) {
    return { error: "Gagal memperbarui: " + (e as Error).message };
  }
  revalidatePath("/admin/titip-sewa");
  revalidatePath("/consignor");
  return { success: true };
}

export async function deleteBookingItemAction(id: number) {
  try {
    await db.delete(bookingItems).where(eq(bookingItems.id, id));
  } catch (e) {
    return { error: "Gagal menghapus: " + (e as Error).message };
  }
  revalidatePath("/admin/titip-sewa");
  revalidatePath("/consignor");
  return { success: true };
}

export async function clearConsignorMonthAction(
  consignorId: number,
  year: number,
  month: number
) {
  const myItems = await db.query.items.findMany({
    where: eq(items.consignorId, consignorId),
    columns: { id: true },
  });
  const itemIds = myItems.map((i) => i.id);
  if (itemIds.length) {
    const bis = await db.query.bookingItems.findMany({
      where: inArray(bookingItems.itemId, itemIds),
      with: { booking: true },
    });
    const ids = bis
      .filter((bi) => {
        const d = bi.booking?.startDate;
        if (!d) return false;
        const dt = new Date(d);
        return dt.getFullYear() === year && dt.getMonth() + 1 === month;
      })
      .map((bi) => bi.id);
    if (ids.length) {
      await db.delete(bookingItems).where(inArray(bookingItems.id, ids));
    }
  }
  revalidatePath("/admin/titip-sewa");
  revalidatePath("/consignor");
  return { success: true };
}

export async function updateItemAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = Number(formData.get("id"));
  const name = parseText(formData.get("name"));
  if (!name) return { error: "Nama barang wajib diisi." };

  let fotoUrl = parseText(formData.get("existingFotoUrl")) || null;
  const imageBase64 = parseText(formData.get("imageFileBase64"));
  if (imageBase64 && imageBase64.startsWith("data:image")) {
    try {
      fotoUrl = await uploadBase64ToCloudinary(imageBase64);
    } catch (err) {
      return { error: "Gagal mengunggah gambar ke Cloudinary." };
    }
  }

  try {
    await db
      .update(items)
      .set({
        categoryId: formData.get("categoryId") ? Number(formData.get("categoryId")) : null,
        name,
        sku: parseText(formData.get("sku")) || null,
        description: parseText(formData.get("description")) || null,
        hargaSewa: parseNum(formData.get("hargaSewa")),
        satuanSewa: parseText(formData.get("satuanSewa")) || "hari",
        stokTotal: Number(parseNum(formData.get("stokTotal"))) || 1,
        maintenanceDays: Number(parseNum(formData.get("maintenanceDays"))) || 0,
        ownerType: parseText(formData.get("ownerType")) || "store",
        consignorId: formData.get("consignorId")
          ? Number(formData.get("consignorId"))
          : null,
        profitSharePct: parseNum(formData.get("profitSharePct")),
        fotoUrl,
        notes: parseText(formData.get("notes")) || null,
        updatedAt: new Date(),
      })
      .where(eq(items.id, id));
  } catch (e) {
    return { error: "Gagal memperbarui: " + (e as Error).message };
  }
  revalidatePath("/admin/items");
  revalidatePath("/");
  redirect("/admin/items");
}

export async function deleteItemAction(id: number) {
  try {
    await db.delete(items).where(eq(items.id, id));
  } catch (e) {
    return { error: "Gagal menghapus: " + (e as Error).message };
  }
  revalidatePath("/admin/items");
  return { success: true };
}

export async function createCategoryAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const name = parseText(formData.get("name"));
  if (!name) return { error: "Nama kategori wajib diisi." };
  try {
    await db.insert(categories).values({
      name,
      description: parseText(formData.get("description")) || null,
    });
  } catch (e) {
    return { error: "Gagal menyimpan: " + (e as Error).message };
  }
  revalidatePath("/admin/categories");
  revalidatePath("/admin/items");
  redirect("/admin/categories");
}

export async function updateCategoryAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = Number(formData.get("id"));
  const name = parseText(formData.get("name"));
  if (!name) return { error: "Nama kategori wajib diisi." };
  try {
    await db
      .update(categories)
      .set({
        name,
        description: parseText(formData.get("description")) || null,
      })
      .where(eq(categories.id, id));
  } catch (e) {
    return { error: "Gagal memperbarui: " + (e as Error).message };
  }
  revalidatePath("/admin/categories");
  revalidatePath("/admin/items");
  redirect("/admin/categories");
}

export async function deleteCategoryAction(id: number) {
  try {
    await db.delete(categories).where(eq(categories.id, id));
  } catch (e) {
    return { error: "Gagal menghapus: " + (e as Error).message };
  }
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function updateSettingsAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const storeName = parseText(formData.get("storeName")) || "yourstory.kp";
  const currency = parseText(formData.get("currency")) || "IDR";
  const defaultDpPct = parseNum(formData.get("defaultDpPct"));
  const lateFeeRule = parseText(formData.get("lateFeeRule")) || null;
  
  let backgroundUrl = parseText(formData.get("existingBackgroundUrl")) || null;
  const imageBase64 = parseText(formData.get("imageFileBase64"));
  if (imageBase64 && imageBase64.startsWith("data:image")) {
    try {
      backgroundUrl = await uploadBase64ToCloudinary(imageBase64);
    } catch (err) {
      return { error: "Gagal mengunggah gambar background ke Cloudinary." };
    }
  }

  try {
    const existing = await db.select().from(settings).limit(1);
    if (existing.length === 0) {
      await db.insert(settings).values({
        storeName,
        currency,
        defaultDpPct,
        lateFeeRule,
        backgroundUrl,
      });
    } else {
      await db
        .update(settings)
        .set({ storeName, currency, defaultDpPct, lateFeeRule, backgroundUrl, updatedAt: new Date() })
        .where(eq(settings.id, existing[0].id));
    }
  } catch (e) {
    return { error: "Gagal menyimpan: " + (e as Error).message };
  }
  revalidatePath("/admin/settings");
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login/admin" });
}

export async function toggleBlacklistAction(
  customerId: number,
  _fd?: FormData,
): Promise<void> {
  try {
    const [c] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, customerId));
    if (c) {
      await db
        .update(customers)
        .set({ blacklist: !c.blacklist })
        .where(eq(customers.id, customerId));
    }
  } catch (e) {
    console.error("toggleBlacklistAction:", e);
  }
  revalidatePath("/admin/customers");
}
