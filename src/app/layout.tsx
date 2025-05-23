import React from "react";
import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

const baseUrl = "https://promptfinops.com";
const imageUrl = `${baseUrl}/output.jpeg`;

export const metadata: Metadata = {
  title: "Prompt FinOps",
  description:
    "Evaluate, price and benchmark your AI Agents Cost and Performance",
  openGraph: {
    title: "Prompt FinOps",
    description:
      "Evaluate, price and benchmark your AI Agents Cost and Performance",
    url: baseUrl,
    siteName: "Prompt FinOps",
    images: [
      {
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: "Prompt FinOps OG Image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prompt FinOps",
    description:
      "Evaluate, price and benchmark your AI Agents Cost and Performance",
    images: [imageUrl],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="antialiased bg-background text-foreground h-full font-sans">
        <div className="min-h-screen flex flex-col items-center justify-center p-6">
          {children}
        </div>
      </body>
      <GoogleAnalytics gaId="G-6E7LZ5KTEB" />
    </html>
  );
}
