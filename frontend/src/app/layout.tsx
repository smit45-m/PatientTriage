import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ParticleBackground from "@/components/ParticleBackground";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PatientTriage.ai — AI-Powered Emergency Triage",
  description: "AI-powered emergency department triage system with LangGraph multi-agent pipeline.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-surface-darker text-gray-200 antialiased overflow-x-hidden relative flex flex-col`}>
        <ParticleBackground />

        {/* Ambient gradient orbs */}
        <div className="fixed top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-sky-500/5 blur-[150px] pointer-events-none" />
        <div className="fixed bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-teal-500/5 blur-[120px] pointer-events-none" />

        <Navbar />

        <div className="relative z-10 flex-1 flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
