export const dynamic = "force-dynamic";

export default function ConsignorDashboard() {
  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-semibold">Dashboard Pemilik Titipan</h1>
      <p className="text-sm text-muted-foreground">
        Pantau barang titipan, riwayat sewa, dan total bagi hasil.
      </p>
      <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
        Fitur consignor (daftar barang, bagi hasil) sedang dikembangkan (fase berikutnya).
      </div>
    </div>
  );
}
