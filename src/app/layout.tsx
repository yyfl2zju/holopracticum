import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope } from "next/font/google";
import Script from "next/script";
import "@xyflow/react/dist/style.css";
import { AppShell } from "@/components/layout/app-shell";
import { ThemeProvider } from "@/components/theme/theme-provider";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "HoloPracticum",
    template: "%s | HoloPracticum",
  },
  description: "面向小微企业和自由职业者的 AI Agent 平台前端 MVP。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${manrope.variable} ${plexMono.variable} antialiased`}>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var key = 'holopracticum-theme';
                  var saved = localStorage.getItem(key);
                  var theme = saved === 'light' || saved === 'dark'
                    ? saved
                    : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                  document.documentElement.dataset.theme = theme;
                  document.documentElement.style.colorScheme = theme;
                } catch (error) {
                  document.documentElement.dataset.theme = 'dark';
                  document.documentElement.style.colorScheme = 'dark';
                }
              })();
            `,
          }}
        />
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
