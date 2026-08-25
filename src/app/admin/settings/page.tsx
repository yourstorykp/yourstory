import { db } from "@/lib/db";
import { settings } from "@/db/schema";
import { SettingsForm } from "@/components/admin/settings-form";
import { updateSettingsAction } from "../actions";

export default async function SettingsPage() {
  const s = await db.select().from(settings).limit(1);
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Pengaturan</h1>
        <p className="text-sm text-muted-foreground">
          Sesuaikan identitas toko & aturan sewa.
        </p>
      </div>
      <SettingsForm action={updateSettingsAction} settings={s[0]} />
    </div>
  );
}
