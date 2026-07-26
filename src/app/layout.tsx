import type { Metadata } from "next";
import { Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import TopNav from "@/components/TopNav/TopNav";
import GridBackground from "@/components/GridBackground/GridBackground";
import { SearchProvider } from "@/components/SearchProvider/SearchProvider";

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
      <body className="min-h-full flex flex-col">
        <SearchProvider>
          <GridBackground />
          <TopNav />
          <main className="relative min-h-0 flex-1">{children}</main>
          {modal}
        </SearchProvider>
      </body>
    </html>
  );
}
