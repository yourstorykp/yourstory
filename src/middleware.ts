import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default NextAuth(authConfig).auth((req: any) => {
  const path = req.nextUrl.pathname;
  const role = (req.auth?.user as { role?: string } | undefined)?.role;

  if (!req.auth) {
    if (path.endsWith("/login")) return;
    const login = path.startsWith("/consignor") ? "/consignor/login" : "/admin/login";
    return NextResponse.redirect(
      new URL(login + "?next=" + encodeURIComponent(path), req.url)
    );
  }

  if (path.startsWith("/consignor") && role !== "consignor") {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (path.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }
});

export const config = {
  matcher: ["/admin/:path*", "/consignor/:path*"],
};
