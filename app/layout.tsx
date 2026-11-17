import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CODATHAN 2K27 | Secure Online Coding Examination Platform',
  description:
    'Department of Computer Applications (UG & PG), Ayya Nadar Janaki Ammal College (Autonomous), Sivakasi. Official Secure Online Coding Platform.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800;900&family=Cinzel+Decorative:wght@700;900&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-void text-[#e6e8ed] antialiased selection:bg-gold-primary selection:text-void min-h-screen">
        {children}
      </body>
    </html>
  );
}
