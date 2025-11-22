import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'

export const metadata: Metadata = {
  title: 'Product Huntr - #1 Growth Hacking & Analytics Tool for Product Hunt',
  description: 'The ultimate growth hacking platform for Product Hunt. Analyze 50,000+ launches, spot viral trends, and master your launch strategy. Trusted by top growth hackers, agencies, and makers to dominate the leaderboard.',
  keywords: 'growth hacking, product hunt analytics, product hunt launch strategy, growth hacker marketing, best product hunt tools, product hunting, viral launch strategies, sean ellis growth hacking, product hunt trends',
  icons: {
    icon: '/Favicon.png',
  },
  openGraph: {
    images: ['/socialshare.png'],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/socialshare.png'],
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
