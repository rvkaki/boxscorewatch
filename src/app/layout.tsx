import "~/styles/globals.css";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import Link from "next/link";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "Box Score Watch",
  description: "NBA Box Score Watch",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body className="dark">
        <TRPCReactProvider>
          <div className="flex min-h-screen flex-col items-center justify-center">
            <nav className="flex w-full items-center justify-between border-b border-neutral-900 px-4 py-2 md:py-4 lg:px-12">
              <div className="flex items-center gap-12">
                <Link href="/" className="text-lg font-bold">
                  BSW
                </Link>

                <div className="flex items-center gap-6 text-neutral-400">
                  <Link href="/games" className="hover:text-white">
                    Games
                  </Link>

                  <Link href="/news" className="hover:text-white">
                    News
                  </Link>
                </div>
              </div>
            </nav>
            {children}
            <Analytics />
            <SpeedInsights />
          </div>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
