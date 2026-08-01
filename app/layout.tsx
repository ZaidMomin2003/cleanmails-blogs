import type { Metadata } from 'next'
import { Inter, Lora } from 'next/font/google'
import './globals.css'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const lora = Lora({ subsets: ['latin'], variable: '--font-lora', display: 'swap', style: ['normal', 'italic'] })

export const metadata: Metadata = {
  title: { default: 'Cold Mail Blog', template: '%s | Cold Mail Blog' },
  description: 'Cold email deliverability, SMTP setup, and outreach guides from cold mail.',
  metadataBase: new URL('https://coldmail.host'),
  icons: {
    icon: [
      { url: '/blog/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/blog/favicon.svg',
  },
  openGraph: { type: 'website', siteName: 'Cold Mail Blog', locale: 'en_US' },
  twitter: { card: 'summary_large_image' },
}

import ToolsSidebar from '@/components/ToolsSidebar'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} ${lora.variable}`} suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()
        `}} />
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-QWXBBLS661" strategy="afterInteractive" />
        <Script id="ga" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-QWXBBLS661');`}</Script>
      </head>
      <body>
        {children}
        <ToolsSidebar />
      </body>
    </html>
  )
}
