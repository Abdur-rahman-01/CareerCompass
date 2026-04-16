import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DevArena | AI Career Agent for Students",
  description: "DevArena is an AI-powered career agent that helps students find internships, hackathons, and scholarships tailored to their profile.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-[#0b1326] text-[#dae2fd] antialiased`}>
        <AuthProvider>
          <Navbar />
          <main className="pt-20">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
