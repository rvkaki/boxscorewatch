import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import Link from "next/link";

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
            <nav className="flex w-full items-center justify-between border-b border-neutral-900 px-4 py-2 lg:px-12 md:py-4">
              <div className="flex items-center gap-4">
                <Link href="/" className="text-lg font-bold">
                  BSW
                </Link>
              </div>
            </nav>
            {children}
          </div>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
