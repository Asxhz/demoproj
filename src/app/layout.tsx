import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import TopNav from "@/components/nav/TopNav";
import { getCurrentUser } from "@/lib/auth";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Claudex",
  description: "Run your projects. Connect your tools. Ship.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();

  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} bg-black text-[#e7e9ea] antialiased min-h-screen`}
      >
        <TopNav user={user} />
        <main className="pt-14">{children}</main>
      </body>
    </html>
  );
}
