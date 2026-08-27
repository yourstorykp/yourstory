"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function loginWithCredentials(formData: FormData) {
  const role = String(formData.get("role") || "admin");
  const next = (formData.get("next") as string | null) || undefined;
  const redirectTo =
    next || (role === "consignor" ? "/consignor" : "/admin");

  try {
    await signIn("credentials", formData, { redirectTo });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email atau password salah." };
    }
    throw error;
  }
}
