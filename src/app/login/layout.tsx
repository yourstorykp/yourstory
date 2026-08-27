import type { ReactNode } from "react";

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <main className="topo-bg grid min-h-screen place-items-center px-4">
      {children}
    </main>
  );
}
