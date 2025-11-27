import "./globals.css";
import type { Metadata } from "next";
import Providers from "./providers";
import Script from 'next/script'
import AnalyticsLoader from "@/components/AnalyticsLoader";
import AppGateway from "@/components/AppGateway";
import StaticNavBar from "@/components/layout/StaticNavBar";
import AgeGate from "@/components/AgeGate";
import CookieConsent from "@/components/CookieConsent";
import FooterLegal from "@/components/FooterLegal";
import ToastContainer from "@/components/ui/Toast";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import SuspensionChecker from "@/components/auth/SuspensionChecker";
import UploadMonitor from "@/components/upload/UploadMonitor";
import GlobalUploadProgress from "@/components/upload/GlobalUploadProgress";
import { Toaster } from 'sonner';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

export const metadata: Metadata = {
  title: {
    default: 'Felora — Plateforme Premium',
    template: '%s — Felora',
  },
  description: 'Rencontres premium — profils vérifiés, messagerie sécurisée, cartes et médias. Rejoignez la plateforme d\'excellence suisse.',
  applicationName: 'Felora',
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  keywords: ['rencontres premium', 'escort', 'profils vérifiés', 'messagerie sécurisée', 'Suisse'],
  authors: [{ name: 'Felora' }],
  creator: 'Felora',
  publisher: 'Felora',
  openGraph: {
    title: 'Felora — Plateforme Premium',
    description: 'Rencontres d\'exception — profils vérifiés, messagerie sécurisée, géolocalisation et médias premium.',
    url: '/',
    siteName: 'Felora',
    type: 'website',
    locale: 'fr_CH',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Felora — Plateforme Premium',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Felora — Plateforme Premium',
    description: 'Rencontres d\'exception — profils vérifiés, messagerie sécurisée.',
    images: ['/opengraph-image'],
    creator: '@felora',
    site: '@felora',
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/apple-icon', type: 'image/png', sizes: '180x180' },
    ],
    other: [
      {
        rel: 'apple-touch-icon',
        url: '/apple-icon',
      },
    ],
  },
  appleWebApp: {
    capable: true,
    title: 'Felora',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  verification: {
    // Ajoute ici les codes de vérification Google, Bing, etc. si nécessaire
  },
}

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover'
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Load translations for next-intl
  const messages = await getMessages();

  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <body className="bg-black text-white">
        {process.env.NEXT_PUBLIC_SENTRY_DSN && (
          <>
            <Script
              src="https://browser.sentry-cdn.com/7.120.1/bundle.tracing.min.js"
              integrity="sha384-NS3e7rEmo9wOaO1IGW/2jF1r8kQeV3k4cHhNnZ2o0mS69a1Ubi9fTj7kZk0m9tWg"
              crossOrigin="anonymous"
              strategy="afterInteractive"
            />
            <Script id="sentry-init" strategy="afterInteractive">
              {`
                try {
                  if (window.Sentry && '${process.env.NEXT_PUBLIC_SENTRY_DSN}') {
                    window.Sentry.init({
                      dsn: '${process.env.NEXT_PUBLIC_SENTRY_DSN}',
                      integrations: [new window.Sentry.BrowserTracing()],
                      tracesSampleRate: ${process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || '0.1'},
                      environment: '${process.env.NODE_ENV}',
                    });
                  }
                } catch (e) { console.warn('Sentry init failed', e) }
              `}
            </Script>
          </>
        )}
        <AnalyticsLoader websiteId={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID} src={process.env.NEXT_PUBLIC_UMAMI_SRC} />
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <SuspensionChecker />
            <AgeGate />
            <AppGateway>
              <div data-app-shell style={{
                minHeight: '100vh',
                paddingTop: 0,
                paddingBottom: 0,
                position: 'relative',
                width: '100%'
              }}>
                {children}
              </div>
              <ConditionalLayout>
                <StaticNavBar />
                <FooterLegal />
              </ConditionalLayout>
            </AppGateway>
            <CookieConsent />
            <ToastContainer />
            <UploadMonitor />
            <GlobalUploadProgress />
            <Toaster
              position="top-center"
              richColors
              closeButton
              expand={true}
              visibleToasts={5}
              toastOptions={{
                style: {
                  background: '#1A1A1A',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  zIndex: 99999,
                },
              }}
            />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
