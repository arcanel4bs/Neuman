import DeployButton from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import HeaderAuth from "@/components/header-auth";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: "Neuman - Synthetic Data Engine",
    template: "%s | Neuman"
  },
  description: "Generate high-quality synthetic data for AI training and testing. Power your models with unlimited, relevant data.",
  keywords: [
    "synthetic data",
    "AI training",
    "data generation",
    "machine learning",
    "artificial intelligence",
    "data testing",
    "data engine"
  ],
  authors: [{ name: "ArcaneL4bs" }],
  creator: "ArcaneL4bs",
  publisher: "Neuman",
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: defaultUrl,
    siteName: 'Neuman',
    title: 'Neuman - Synthetic Data Engine',
    description: 'Generate high-quality synthetic data for AI training and testing. Power your models with unlimited, context-aware data.',
    images: [
      {
        url: `${defaultUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Neuman - Synthetic Data Engine'
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Neuman - Synthetic Data Engine',
    description: 'Generate high-quality synthetic data for AI training and testing',
    creator: '@labsarcane',
    images: [`${defaultUrl}/og-image.jpg`],
  },
  verification: {
    google: 'your-google-verification-code', // Add your Google Search Console verification code
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen">
            {children}
            <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs py-8">
              <p>
                Powered by{" "}
                <a
                  href="https://x.com/labsarcane"
                  target="_blank"
                  className="font-bold hover:underline"
                  rel="noreferrer"
                >
                  ArcaneL4bs
                </a>
              </p>
            </footer>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
