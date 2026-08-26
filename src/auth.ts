import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      authorize: async (creds) => {
        const email = creds?.email as string | undefined;
        const password = creds?.password as string | undefined;
        const role = (creds?.role as string | undefined) || "admin";
        if (!email || !password) return null;

        const { db } = await import("@/lib/db");
        const { users, consignors } = await import("@/db/schema");
        const { eq } = await import("drizzle-orm");
        const bcrypt = (await import("bcryptjs")).default;

        if (role === "consignor") {
          const [c] = await db
            .select()
            .from(consignors)
            .where(eq(consignors.email, email));
          if (!c) return null;
          const ok = await bcrypt.compare(password, c.passwordHash);
          if (!ok) return null;
          return { id: String(c.id), email: c.email, name: c.name, role: "consignor" };
        }

        const [u] = await db
          .select()
          .from(users)
          .where(eq(users.email, email));
        if (!u) return null;
        const ok = await bcrypt.compare(password, u.passwordHash);
        if (!ok) return null;
        return { id: String(u.id), email: u.email, name: u.name, role: "admin" };
      },
    }),
  ],
});
