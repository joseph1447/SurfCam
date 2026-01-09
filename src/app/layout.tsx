// Root layout - redirects to locale-based layout
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { defaultLocale, getLocaleFromHeaders } from '@/i18n/config';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout is only for the root path, middleware handles locale routing
  return <>{children}</>;
}
