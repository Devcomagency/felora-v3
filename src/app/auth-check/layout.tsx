import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Accès restreint — Felora',
  description: 'Accès sécurisé à Felora',
  robots: {
    index: false, // Ne pas indexer cette page
    follow: false,
  },
};

export default function AuthCheckLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Layout minimal : pas de navbar, pas de footer, juste le contenu
  return <>{children}</>;
}
