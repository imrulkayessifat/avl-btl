import type { Metadata } from 'next'
import ToasterProvider from '../components/ToasterProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Project Ledger Pro | Akij Venture Ltd',
  description: 'Project management and financial tracking system for Akij Venture Ltd',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-GB">
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
        />
      </head>
      <body className="bg-slate-50">
        {children}
        <ToasterProvider />
      </body>
    </html>
  )
}


