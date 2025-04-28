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
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rent a Ride - Premium Car Rental Service",
  description: "Rent a Ride offers premium car rental services for every occasion. Experience luxury, comfort, and reliability.",
  icons: {
    icon: "/logo.ico",
    apple: "/logo.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 dark:bg-gray-900">
        <Providers>
          <DarkModeProvider>
            <AuthProvider>
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <Toaster
                  position="top-center"
                  reverseOrder={false}
                />
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