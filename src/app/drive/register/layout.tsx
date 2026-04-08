import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Chauffeur Registration',
  description: 'Apply to become a Rihla Limo chauffeur and join our elite network of premium transportation professionals.',
  openGraph: {
    url: '/drive/register',
  },
}

export default function DriveRegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
