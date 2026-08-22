import type { Metadata } from "next";
import { Press_Start_2P, Silkscreen, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "./providers";
import "./globals.css";

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start-2p",
});

const silkscreen = Silkscreen({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-silkscreen",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

import ChatWidget from "./components/chat-widget";
import GlobalChatWidget from "./components/global-chat-widget";

export const metadata: Metadata = {
  title: "Wilbert | Software Engineer",
  description: "High-performance portfolio of Wilbert, Software Engineer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${pressStart2P.variable} ${silkscreen.variable} ${jetbrainsMono.variable} antialiased selection:bg-foreground selection:text-background min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <ChatWidget />
          <GlobalChatWidget />
        </ThemeProvider>
      </body>
    </html>
  );
}
