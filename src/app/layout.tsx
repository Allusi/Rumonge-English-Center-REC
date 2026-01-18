import type { Metadata } from "next";
import { PT_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AudioCacheProvider } from "@/context/audio-cache-context";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { FirebaseErrorListener } from "@/components/FirebaseErrorListener";
import { NotificationPermissionRequester } from "@/components/NotificationPermissionRequester";


export const metadata: Metadata = {
  title: "REC Online",
  description: "Rumonge English Center Online Monitoring System",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8584759829627880"
     crossOrigin="anonymous"></script>
      </head>
      <body className="font-body antialiased">
          <FirebaseClientProvider>
            <AudioCacheProvider>
              {children}
            </AudioCacheProvider>
            <FirebaseErrorListener />
            <NotificationPermissionRequester />
          </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
