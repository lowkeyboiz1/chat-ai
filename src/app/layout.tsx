import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Providers from '@/providers/Providers'
import '@/styles/globals.css'
import ModalLoading from '@/components/ModalLoading'
import { Toaster, toast } from 'sonner'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body className={`${inter.variable} antialiased`}>
        <Providers>
          <ModalLoading />
          {children}

          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
