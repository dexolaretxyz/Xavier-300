import type { Metadata } from "next";
import { Providers } from "../components/providers";
import { AuthCookieSync } from "@/components/auth-cookie-sync";
import "./globals.css";

export const metadata: Metadata = {
  title: "Xavier 300",
  description: "Practice like it's real. Pass like you prepared.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* 
        suppressHydrationWarning is added to html because the theme script (or our ThemeProvider) 
        modifies data-theme attribute on client side which differs from initial server HTML 
      */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('xavier-theme') ?? 
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.setAttribute('data-theme', theme);
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-ui bg-bg-primary text-text-primary antialiased selection:bg-accent-primary selection:text-text-inverse">
        <Providers>
          <AuthCookieSync />
          {children}
        </Providers>
      </body>
    </html>
  );
}
