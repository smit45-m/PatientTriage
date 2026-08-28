import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParticleBackground from "@/components/ParticleBackground";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PatientTriage.ai — Intelligent Emergency Department Decision Support",
  description: "Advanced AI emergency clinical triage system with LangGraph multi-agent pipeline and 100% ESI-1 recall.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-[#F8F9FC] text-slate-900 antialiased overflow-x-hidden relative flex flex-col justify-between`}>
        <ParticleBackground />

        {/* Ambient subtle purple/indigo decorative light gradients */}
        <div className="fixed top-0 left-1/4 w-[700px] h-[500px] rounded-full bg-purple-200/25 blur-[160px] pointer-events-none -z-10" />
        <div className="fixed top-1/3 right-10 w-[500px] h-[500px] rounded-full bg-indigo-100/35 blur-[140px] pointer-events-none -z-10" />
        <div className="fixed bottom-10 left-10 w-[600px] h-[400px] rounded-full bg-purple-100/40 blur-[150px] pointer-events-none -z-10" />

        <Navbar />

        <div className="relative z-10 flex-1 flex flex-col">
          {children}
        </div>

        <Footer />
      </body>
    </html>
  );
}
