import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./styles/components/navbar.css";
import "./styles/components/features.css";
import "./styles/components/hero.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { DarkModeProvider } from "@/contexts/DarkModeContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DriveEasy - Premium Car Rental Service",
  description: "DriveEasy offers premium car rental services for every occasion. Experience luxury, comfort, and reliability.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <DarkModeProvider>
            <AuthProvider>
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow pt-16">
                  {children}
                </main>
                <Footer />
              </div>
            </AuthProvider>
          </DarkModeProvider>
        </Providers>
      </body>
    </html>
  );
}