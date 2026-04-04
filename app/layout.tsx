import type { Metadata } from "next";
import { DM_Sans, Bebas_Neue, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  weight: "400",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "BeFitBeStrong — Premium Gym Equipment & Supplements India",
    template: "%s | BeFitBeStrong",
  },
  description:
    "India's premium gym e-commerce platform. Shop barbells, dumbbells, protein supplements, gym apparel & workout programs. Expert-curated gear for serious athletes.",
  keywords: [
    "gym equipment india",
    "buy barbell india",
    "protein supplements online",
    "gym accessories",
    "home gym setup",
    "workout equipment",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "BeFitBeStrong",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${bebasNeue.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-[#0A0A0A] text-[#F2F2F7] font-(family-name:--font-dm-sans)">
        {children}
      </body>
    </html>
  );
}
