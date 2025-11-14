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

export const metadata: Metadata = {
  title: {
    default: 'Felora — Plateforme Premium',
    template: '%s — Felora',
  },
  description: 'Rencontres premium — profils vérifiés, messagerie sécurisée, cartes et médias.',
  applicationName: 'Felora',
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Felora',
    description: 'Rencontres premium — profils vérifiés, messagerie sécurisée, cartes et médias.',
    url: '/',
    siteName: 'Felora',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover'
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
      </body>
    </html>
  );
}
