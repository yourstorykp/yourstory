import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
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

        // Dynamic import agar middleware (Edge) tidak membundle driver pg dan library crypto/Node
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
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.uid = (user as { id?: string }).id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string | undefined;
        (session.user as { id?: string }).id = token.uid as string | undefined;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
