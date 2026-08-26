export function formatRupiah(value: number | string | null | undefined): string {
  const n = typeof value === "string" ? parseFloat(value) : (value ?? 0);
  if (isNaN(n)) return "Rp0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function parseNum(value: FormDataEntryValue | null): string {
  if (value === null) return "0";
  const n = parseFloat(String(value).replace(/[^0-9.]/g, ""));
  return isNaN(n) ? "0" : String(n);
}

export function parseText(value: FormDataEntryValue | null): string {
  return value === null ? "" : String(value).trim();
}

export function formatTanggal(value: string | Date | null | undefined): string {
  if (!value) return "—";
  let y: number, m: number, d: number;
  if (typeof value === "string") {
    const parts = value.split("T")[0].split("-");
    if (parts.length !== 3) return String(value);
    y = Number(parts[0]);
    m = Number(parts[1]);
    d = Number(parts[2]);
  } else {
    y = value.getFullYear();
    m = value.getMonth() + 1;
    d = value.getDate();
  }
  if (![y, m, d].every((n) => !isNaN(n))) return "—";
  const yy = String(y).slice(-2);
  const mm = String(m).padStart(2, "0");
  const dd = String(d).padStart(2, "0");
  return `${dd}/${mm}/${yy}`;
}

export function formatTanggalWaktu(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const base = formatTanggal(value);
  let jam = "00:00";
  const d = typeof value === "string" ? new Date(value) : value;
  if (!isNaN(d.getTime())) {
    jam = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }
  return `${base} ${jam}`;
}
