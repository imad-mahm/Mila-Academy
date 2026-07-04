import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "./components/SmoothScrollProvider";
import CustomCursor from "./components/CustomCursor";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mila Academy",
  description: "Mila Football Academy & Mila Basket Academy — Train with the best in Lebanon.",
  icons: { icon: "/logos/mfa_favicon.png" },
  openGraph: { images: ["/logos/mfa_hq_transparent.png"] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}>
      {/* Inline script runs before React hydrates — prevents light/dark flash */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('mila-theme')||'dark';document.documentElement.className=document.documentElement.className.replace(/\\b(dark|light)\\b/g,'')+' '+t;document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
        <CustomCursor />
      </body>
    </html>
  );
}
