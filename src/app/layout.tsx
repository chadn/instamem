import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/providers/auth-provider'
import { NetworkProvider } from '@/providers/network-provider'
import { SyncProvider } from '@/providers/sync-provider'

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
})

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
})

export const metadata: Metadata = {
    title: 'InstaMem - Your Personal Memory Assistant',
    description: 'Instantly remember the details of your life',
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'InstaMem',
    },
}

export const viewport = {
    themeColor: '#3b82f6',
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <head>
                <link rel="manifest" href="/manifest.json" />
            </head>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <NetworkProvider>
                    <AuthProvider>
                        <SyncProvider>{children}</SyncProvider>
                    </AuthProvider>
                </NetworkProvider>
            </body>
        </html>
    )
}
