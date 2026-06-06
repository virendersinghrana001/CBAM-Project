import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ecoborder.app"),
  title: {
    default: "EcoBorder — The free CBAM toolkit",
    template: "%s | EcoBorder",
  },
  description:
    "Free, browser-based CBAM tools: estimate your carbon border tax, check CN codes, score your readiness and build a quarterly report. No signup, no data sharing.",
  keywords: [
    "CBAM", "carbon border adjustment mechanism", "CBAM calculator", "CN code checker",
    "carbon tax calculator", "EU CBAM", "embedded emissions", "CBAM report",
  ],
  openGraph: {
    title: "EcoBorder — The free CBAM toolkit",
    description:
      "Free, browser-based CBAM tools: calculator, CN code checker, readiness check and report builder.",
    type: "website",
    siteName: "EcoBorder",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-white">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
