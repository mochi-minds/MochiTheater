import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "MochiTheater — Watch AI Agents Build",
  description: "Watch nine specialized AI agents collaborate to build a full-stack dApp — in real time.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" data-scroll-behavior="smooth">
      <body>
        <Nav />
        <div className="pt-16">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
