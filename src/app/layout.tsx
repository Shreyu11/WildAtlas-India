import type { Metadata } from "next";
import { Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import TopNav from "@/components/TopNav/TopNav";
import GridBackground from "@/components/GridBackground/GridBackground";
import { SearchProvider } from "@/components/SearchProvider/SearchProvider";
import { MapSettingsProvider } from "@/components/MapSettingsProvider/MapSettingsProvider";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WildAtlas India",
  description: "A state-first, photo-led explorer of India's wildlife.",
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="relative h-full">
        <MapSettingsProvider>
          <SearchProvider>
            <GridBackground />
            {/* Full-bleed, edge-to-edge — TopNav floats on top of this (fixed,
                transparent) rather than sitting in its own row above it, so
                the map is actually visible/blurred behind the header instead
                of just the plain GridBackground dots. */}
            <main className="absolute inset-0">{children}</main>
            <TopNav />
            {modal}
          </SearchProvider>
        </MapSettingsProvider>
      </body>
    </html>
  );
}
