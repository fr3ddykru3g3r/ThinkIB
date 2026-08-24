import './globals.css';
import React from 'react';
import CustomCursor from './components/CustomCursor';
import PongPopup from './components/PongPopup';

export const metadata = {
  title: 'The Archive — IB Study & Revision Repository',
  description: 'A curated repository of resources, past papers, and academic notes.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body>
        <CustomCursor />
        <header>
          <div className="header-content">
            <a href="/" className="logo">THE ARCHIVE</a>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
              <span className="academic-edition">IBDP COLLABORATIVE VAULT</span>
              <PongPopup />
            </div>
          </div>
        </header>
        <main className="container">
          {children}
        </main>
      </body>
    </html>
  );
}
