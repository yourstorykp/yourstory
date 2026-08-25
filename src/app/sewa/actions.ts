"use server";

import { parseText } from "@/lib/format";
import { createBooking } from "@/lib/booking";

export type BookingState = {
  error?: string;
  success?: boolean;
  kode?: string;
  total?: string;
  dp?: string;
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
    return { success: true, kode: code, total: String(total), dp: String(dp) };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal membuat pesanan.";
    return { error: msg };
  }
}
