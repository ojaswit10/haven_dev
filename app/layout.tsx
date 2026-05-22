import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import { Lora, Nunito } from "next/font/google";

const lora = Lora({ subsets: ["latin"], variable: "--font-heading" });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-body" });
const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "haven",
  description: "A safe space to understand yourself and find your way back.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geist.className} ${lora.variable} ${nunito.variable}`}>
        <Providers>
          <Navbar />
          <div className="pt-16">{children}</div>
        </Providers>
      </body>
    </html>
  );
}