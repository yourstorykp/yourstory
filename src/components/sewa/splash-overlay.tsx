"use client";

import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/logo";

export function SplashOverlay() {
  const [visible, setVisible] = useState(true);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const hide = setTimeout(() => setFade(true), 800);
    const remove = setTimeout(() => setVisible(false), 1000);
    return () => {
      clearTimeout(hide);
      clearTimeout(remove);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-sand transition-opacity duration-200 ${
        fade ? "opacity-0" : "opacity-100"
      }`}
    >
      <Logo className="mb-6" />
      <h1 className="font-heading text-4xl font-semibold text-forest-deep sm:text-5xl">
        Manajemen Rental,
        <br />
        <span className="text-terracotta">tanpa ribet.</span>
      </h1>
    </div>
  );
}
