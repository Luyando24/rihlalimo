import type { Metadata } from "next";
import "./globals.css";
import { createClient } from "@/utils/supabase/server";
import BottomNav from "@/components/layout/BottomNav";

// Using system fonts to avoid build-time fetch errors
const geistSans = { variable: "--font-sans" };
const geistMono = { variable: "--font-mono" };

const defaultUrl = process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : new URL('https://www.rihlaride.com');

export const metadata: Metadata = {
  metadataBase: defaultUrl,
  title: {
    default: "Rihla Limo | Premium Global Chauffeur Service",
    template: "%s | Rihla Limo"
  },
  description: "Experience world-class luxury transportation, airport transfers, and point-to-point chauffeur services in major cities worldwide. Book your premium ride with Rihla Limo today.",
  keywords: ["limousine", "chauffeur", "luxury transport", "airport transfer", "corporate travel", "black car service", "global chauffeur", "Rihla Limo"],
  authors: [{ name: "Rihla Limo" }],
  creator: "Rihla Limo",
  publisher: "Rihla Limo",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Rihla Limo",
    title: "Rihla Limo | Premium Global Chauffeur Service",
    description: "Experience world-class luxury transportation, airport transfers, and point-to-point chauffeur services.",
    images: [
      {
        url: "/og-image.jpg", // Fallback to an og-image if available
        width: 1200,
        height: 630,
        alt: "Rihla Limo Premium Chauffeur Service",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rihla Limo | Premium Global Chauffeur Service",
    description: "Experience world-class luxury transportation, airport transfers, and point-to-point chauffeur services.",
    images: ["/og-image.jpg"],
    creator: "@RihlaLimo",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'XFapRgFnLvKGxd2doGCrFM-wSIcDANkeinooDoe6YRY',
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    role = profile?.role;
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <div className="pb-20 md:pb-0 min-h-screen">
          {children}
        </div>
        <BottomNav user={user} role={role} />
      </body>
    </html>
  );
}
