"use server";

import { db } from "@/lib/db";
import { settings } from "@/db/schema";
import { parseText } from "@/lib/format";
import { createBooking, createBookingMulti } from "@/lib/booking";

export type BookingState = {
  error?: string;
  success?: boolean;
  kode?: string;
  total?: string;
  dp?: string;
  adminWa?: string;
};

export async function createBookingAction(
  _prev: BookingState,
  formData: FormData,
): Promise<BookingState> {
  const itemId = Number(formData.get("itemId"));
  const name = parseText(formData.get("name"));
  const contact = parseText(formData.get("contact"));
  const email = parseText(formData.get("email"));
  const startDate = parseText(formData.get("startDate"));
  const endDate = parseText(formData.get("endDate"));
  const qty = Math.max(1, Number(formData.get("qty") || "1") || 1);
  const notes = parseText(formData.get("notes"));

  if (!name || !contact) {
    return { error: "Nama dan nomor WhatsApp wajib diisi." };
  }
  if (!/^[0-9()+\-\s]{6,}$/.test(contact)) {
    return { error: "Nomor WhatsApp tidak valid." };
  }
  if (!startDate || !endDate) {
    return { error: "Tanggal sewa dan tanggal kembali wajib diisi." };
  }
  if (new Date(endDate) < new Date(startDate)) {
    return { error: "Tanggal kembali tidak boleh sebelum tanggal sewa." };
  }

  try {
    const { code, total, dp } = await createBooking({
      itemId,
      name,
      contact,
      email,
      startDate,
      endDate,
      qty,
      notes,
    });
    const s = await db.select({ adminWa: settings.adminWhatsapp }).from(settings).limit(1);
    return { success: true, kode: code, total: String(total), dp: String(dp), adminWa: s[0]?.adminWa || "" };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal membuat pesanan.";
    return { error: msg };
  }
}

export async function createCartBookingAction(
  _prev: BookingState,
  formData: FormData,
): Promise<BookingState> {
  const name = parseText(formData.get("name"));
  const contact = parseText(formData.get("contact"));
  const email = parseText(formData.get("email"));
  const startDate = parseText(formData.get("startDate"));
  const endDate = parseText(formData.get("endDate"));
  const notes = parseText(formData.get("notes"));

  const itemIds = (formData.getAll("itemId") as string[]).map(Number);
  const qtys = (formData.getAll("qty") as string[]).map(
    (v) => Math.max(1, Number(v) || 1),
  );
  const items = itemIds
    .map((id, i) => ({ itemId: id, qty: qtys[i] ?? 1 }))
    .filter((p) => p.itemId > 0);

  if (!name || !contact) {
    return { error: "Nama dan nomor WhatsApp wajib diisi." };
  }
  if (!/^[0-9()+\-\s]{6,}$/.test(contact)) {
    return { error: "Nomor WhatsApp tidak valid." };
  }
  if (!startDate || !endDate) {
    return { error: "Tanggal sewa dan tanggal kembali wajib diisi." };
  }
  if (new Date(endDate) < new Date(startDate)) {
    return { error: "Tanggal kembali tidak boleh sebelum tanggal sewa." };
  }
  if (!items.length) {
    return { error: "Keranjang kosong." };
  }

  try {
    const { code, total, dp } = await createBookingMulti({
      items,
      name,
      contact,
      email,
      startDate,
      endDate,
      notes,
    });
    const s = await db.select({ adminWa: settings.adminWhatsapp }).from(settings).limit(1);
    return { success: true, kode: code, total: String(total), dp: String(dp), adminWa: s[0]?.adminWa || "" };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal membuat pesanan.";
    return { error: msg };
  }
}
