"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from '@/hooks/useTranslations';
import { usePathname, useRouter } from 'next/navigation';

export default function Header() {
  const t = useTranslations();
  const { isAuthenticated, signOut, user, loading } = useAuth();
  const router = useRouter();
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  // Debug logging
  console.log('Header - Auth state:', { isAuthenticated, user: user?.email, loading });

  // Helper to handle anchor navigation
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    if (pathname === '/') {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.hash = `#${sectionId}`;
      }
    } else {
      router.push(`/#${sectionId}`);
    }
  };

  return (
    <header className="border-b sticky top-0 bg-background z-50">
      <div className="container mx-auto py-4 px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3">
          <Image 
            src="/applogoo.png"
            alt="AI Scanner Logo"
            width={150}
            height={40}
            className="h-10 w-auto"
          />
          <span className="text-xl font-bold bg-clip-text text-transparent animate-text-gradient">
            AI Image or Not
          </span>
        </Link>
        <nav className="hidden md:flex space-x-6">
          <Link href="/" className="text-foreground font-medium hover:text-fuchsia-600 transition-colors">{t.header.nav.home}</Link>
          <Link href="/scanner" className="text-muted-foreground hover:text-fuchsia-600 transition-colors">Scanner</Link>
          <Link href="/pricing" className="text-muted-foreground hover:text-fuchsia-600 transition-colors">Pricing</Link>
          <a href="#faq" className="text-muted-foreground hover:text-fuchsia-600 transition-colors" onClick={e => handleNavClick(e, 'faq')}>{t.header.nav.faq}</a>
        </nav>
        <div className="flex items-center space-x-3">
          {loading ? (
            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
          ) : isAuthenticated ? (
            <>
              <Link href="/profile">
                <Button variant="outline" size="sm" className="rounded-full hover:bg-fuchsia-50 hover:border-fuchsia-400 hover:text-fuchsia-600 transition-colors">My Profile</Button>
              </Link>
              <Button size="sm" onClick={signOut} className="rounded-full hover:scale-105 transition-transform">{t.header.nav.logout}</Button>
            </>
          ) : (
            <Button size="sm" onClick={() => {
              console.log('Login button clicked!');
              router.push('/login');
            }} className="rounded-full hover:scale-105 transition-transform">{t.header.nav.login}</Button>
          )}
        </div>
      </div>
    </header>
  );
} 