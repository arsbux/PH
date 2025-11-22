import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'

const title = 'Product Huntr - #1 Growth Hacking & Analytics Tool for Product Hunt'
const description = 'The ultimate growth hacking platform for Product Hunt. Analyze 50,000+ launches, spot viral trends, and master your launch strategy. Trusted by top growth hackers, agencies, and makers to dominate the leaderboard.'
const image = 'https://rafddhfuidgiamkxdqyg.supabase.co/storage/v1/object/public/avatars/5e59793f-d2b0-47bc-8321-bc69fdf5aa2f/socialshare1.png'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://producthuntr.com'),
  title,
  description,
  keywords: 'growth hacking, product hunt analytics, product hunt launch strategy, growth hacker marketing, best product hunt tools, product hunting, viral launch strategies, sean ellis growth hacking, product hunt trends',
  icons: {
    icon: '/Favicon.png',
  },
  openGraph: {
    title,
    description,
    url: '/',
    siteName: 'Product Huntr',
    images: [
      {
        url: image,
        width: 1200,
        height: 630,
        alt: 'Product Huntr Dashboard',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [image],
    creator: '@producthuntr',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
