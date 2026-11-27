import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Icon Refactor",
  description:
    "Turn one image into ready-to-use icons for tab bars, app icons, favicons and more, with format convert, compression and custom sizes.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
