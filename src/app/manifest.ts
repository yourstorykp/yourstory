import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "yourstory.kp — Rental ERP",
    short_name: "yourstory.kp",
    description: "Manajemen rental: inventaris, booking, konsinyasi.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5efe3",
    theme_color: "#2f5d44",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      {
        src: "/icon-maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
