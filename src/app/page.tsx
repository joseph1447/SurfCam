// Root page - redirects to locale-based page via middleware
import { redirect } from 'next/navigation';

export default function RootPage() {
  // Middleware handles the locale detection and redirection
  redirect('/es');
}
