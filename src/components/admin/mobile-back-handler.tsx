"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

export function MobileBackHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const isFirstMount = useRef(true);

  useEffect(() => {
    const segments = pathname.split("/").filter(Boolean);
    
    // Only apply on nested admin pages (e.g., /admin/customers/edit)
    // segments: ['admin', 'customers', 'edit'] -> length >= 3
    if (segments.length > 2 && segments[0] === "admin") {
      // If the user lands here directly (e.g. refresh), history length is small.
      // We push a fake state to trap the back button.
      if (isFirstMount.current && window.history.length <= 2) {
        window.history.pushState({ isFakeBackTrap: true }, "");
      }
      isFirstMount.current = false;

      const handlePopState = (e: PopStateEvent) => {
        // The user swiped back or pressed the physical back button.
        // Navigate to the parent folder.
        const parentPath = "/" + segments.slice(0, -1).join("/");
        router.push(parentPath);
      };

      window.addEventListener("popstate", handlePopState);
      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, [pathname, router]);

  return null;
}
