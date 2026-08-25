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
