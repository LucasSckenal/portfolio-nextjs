import type { Metadata } from 'next';
import '../styles/globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';

export const metadata: Metadata = {
  title: { default: 'Luan | Back-End Developer', template: '%s | Luan' },
  description: 'Portfólio de Luan — estudante de Ciências da Computação com foco em desenvolvimento Back-End. Python, Java, Crystal e SQL.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      {/*
        body is display:flex flex-direction:column (set in globals.css)
        so Footer always sticks to the bottom regardless of content height.
      */}
      <body>
        <Header />
        {/*
          PageTransition is a 'use client' component that wraps children
          with AnimatePresence keyed by pathname — works with App Router.
          flex:1 ensures main expands to push footer down.
        */}
        <PageTransition>
          <main style={{ flex: 1 }}>{children}</main>
        </PageTransition>
        <Footer />
      </body>
    </html>
  );
}
