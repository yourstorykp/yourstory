import { db } from "@/lib/db";
import { customers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { CustomerEditForm } from "@/components/admin/customer-edit-form";

export const dynamic = "force-dynamic";

export default async function EditCustomerPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = Number(params.id);
  if (isNaN(id)) notFound();

  const [customer] = await db.select().from(customers).where(eq(customers.id, id));
  if (!customer) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Edit Pelanggan</h1>
        <p className="text-sm text-muted-foreground">Ubah informasi pelanggan.</p>
      </div>
      <CustomerEditForm customer={customer} />
    </div>
  );
}
