import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "@/styles/globals.css";
import { Providers } from "@/components/shared/Providers";
import { APP_NAME, APP_DESCRIPTION, APP_URL } from "@/constants";

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s | ${APP_NAME}` },
  description: APP_DESCRIPTION,
  metadataBase: new URL(APP_URL),
  keywords: ["sosial media", "joteng", "berbagi foto", "berbagi video", "chat"],
  authors: [{ name: "JOTENG" }],
  creator: "JOTENG",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: APP_URL,
    siteName: APP_NAME,
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: APP_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: ["/images/og-image.png"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/favicon.ico",
    apple: "/icons/apple-touch-icon.png",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="dark">
      <body>
        <Providers>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "#1a1a1a",
                color: "#f5f5f5",
                border: "1px solid #333",
                borderRadius: "12px",
              },
              success: { iconTheme: { primary: "#6c63ff", secondary: "#fff" } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
