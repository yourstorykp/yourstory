"use client";

import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/logo";

export function SplashOverlay() {
  const [visible, setVisible] = useState(() => {
    if (typeof window !== "undefined") {
      return !sessionStorage.getItem("splashShown");
    }
    return true;
  });
  const [fade, setFade] = useState(false);

  useEffect(() => {
    if (!visible) return;
    
    sessionStorage.setItem("splashShown", "1");
    const hide = setTimeout(() => setFade(true), 1800);
    const remove = setTimeout(() => setVisible(false), 2000);
    return () => {
      clearTimeout(hide);
      clearTimeout(remove);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-sand transition-opacity duration-200 ${
        fade ? "opacity-0" : "opacity-100"
      }`}
    >
      <Logo className="scale-110" />
    </div>
  );
}
