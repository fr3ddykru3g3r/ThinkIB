import './globals.css';
import './study-design.css';
import 'katex/dist/katex.min.css';
import React from 'react';
import HeaderNav from './components/HeaderNav';
import { isWdc, siteBrand, learnUrl } from '@/lib/site-brand';

export const metadata = {
  title: `${siteBrand.name} — IB, SAT & AMC study resources`,
  description: 'IB past papers by topic, Digital SAT practice tests and AMC 12 lessons, free.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-brand={isWdc ? "wdc" : "archive"} suppressHydrationWarning>
      <head>
        <link rel="icon" type={isWdc ? "image/png" : "image/svg+xml"} href={isWdc ? "/wdc-mark.png" : "/favicon.svg"} />
        <link rel="shortcut icon" href={isWdc ? "/wdc-mark.png" : "/favicon.svg"} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href={isWdc ? "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" : "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"}
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('thinkib_theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body>

        <HeaderNav />
        <main id="main-content" className="container">
          {children}
        </main><footer className="learn-footer"><span>{siteBrand.name} · Study resources and practice</span>{isWdc ? <a href="https://www.worlddebatecollective.org/">Back to World Debate Collective ↗</a> : <a href={learnUrl}>Also on WDC Learn ↗</a>}<a href="/history">Your practice history</a></footer>
      </body>
    </html>
  );
}
