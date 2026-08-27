import { redirect } from "next/navigation";

export default async function AlurRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/bookings/${id}`);
}
