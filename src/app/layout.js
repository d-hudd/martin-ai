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

// Move metadata to separate file to avoid client/server mismatch
export const metadata = {
  title: "Martin AI - Quantum Code Assistant",
  description: "A futuristic AI coding companion powered by advanced language models",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full bg-black`}
      >
        {children}
      </body>
    </html>
  );
}