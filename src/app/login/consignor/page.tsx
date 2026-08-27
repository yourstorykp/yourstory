import { Suspense } from "react";
import { LoginForm } from "@/components/admin/login-form";

export default function ConsignorLoginPage() {
  return (
    <Suspense>
      <LoginForm role="consignor" />
    </Suspense>
  );
}
