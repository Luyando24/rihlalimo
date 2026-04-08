import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Log in or Sign up',
  description: 'Access your Rihla Limo account to manage bookings, view ride history, and update your profile.',
  openGraph: {
    url: '/login',
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
