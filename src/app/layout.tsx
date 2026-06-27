import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CrowdLiner — Premium Crowd Tracking & Planning",
  description: "Real-time crowd tracking, historical patterns, and predictive planning for transit stations, tech parks, shopping streets, and malls in Bengaluru.",
  keywords: ["CrowdLiner", "Bengaluru", "Crowd Tracking", "Live Commute", "Traffic", "Majestic Station", "Indiranagar", "Predictive Planning"],
  authors: [{ name: "CrowdLiner Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      style={{ colorScheme: "dark" }}
    >
      <body className="min-h-full bg-background text-foreground selection:bg-primary/20 selection:text-primary flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
