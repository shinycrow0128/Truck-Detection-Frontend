import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Truck Detection | Cloud Library",
  description: "View truck detection data and camera device data",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
