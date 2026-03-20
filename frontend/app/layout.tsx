import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: 'MedSafe Discharge | Patient Discharge Management',
  description: 'Streamlined discharge session management for healthcare professionals',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#4f6af5',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-gray-50`}>
        <nav className="fixed top-0 left-0 right-0 h-14 bg-white border-b z-50 flex items-center px-6 gap-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <span className="font-bold text-blue-600 mr-4">MedSafe Docs:</span>
          <a href="/dashboard" className="text-sm font-medium hover:text-blue-500">Dashboard</a>
          <a href="/new-session" className="text-sm font-medium hover:text-blue-500">New Session</a>
          <a href="/home-meds" className="text-sm font-medium hover:text-blue-500">Home Meds</a>
          <a href="/discharge-meds" className="text-sm font-medium hover:text-blue-500">Discharge Meds</a>
          <a href="/photo-capture" className="text-sm font-medium hover:text-blue-500">OCR</a>
          <a href="/medication-review" className="text-sm font-medium hover:text-blue-500">Review</a>
          <a href="/ai-comparison" className="text-sm font-medium hover:text-blue-500">AI Results</a>
          <a href="/medication-detail" className="text-sm font-medium hover:text-blue-500">Detail</a>
          <a href="/patient-instructions" className="text-sm font-medium hover:text-blue-500">Instructions</a>
          <a href="/pharmacist-escalation" className="text-sm font-medium hover:text-blue-500">Escalation</a>
          <a href="/session-summary" className="text-sm font-medium hover:text-blue-500">Summary</a>
        </nav>
        <main className="pt-14 min-h-screen">
          {children}
        </main>
        <Analytics />
      </body>
    </html>
  )
}
