import type { ReactNode } from "react";

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <main className="topo-bg flex min-h-screen items-center justify-center px-4">
      {children}
    </main>
  );
}
