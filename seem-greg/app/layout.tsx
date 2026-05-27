import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Seem Greg — Where The Fun Never Stops!",
  description: "Trusted by 18 million players and counting. Play the best mobile casino games.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
