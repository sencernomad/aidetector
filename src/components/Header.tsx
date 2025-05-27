"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from '@/hooks/useTranslations';
import { usePathname, useRouter } from 'next/navigation';

export default function Header() {
  const t = useTranslations();
  const { isAuthenticated, signIn, signOut } = useAuth();
  const router = useRouter();
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

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
    <header className="border-b sticky top-0 bg-background z-10">
      <div className="container mx-auto py-4 px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <Image 
            src="/applogo.png"
            alt="AI Scanner Logo"
            width={150}
            height={40}
            className="h-10 w-auto"
          />
        </Link>
        <nav className="hidden md:flex space-x-6">
          <Link href="/" className="text-foreground font-medium">{t.header.nav.home}</Link>
          <Link href="/scanner" className="text-muted-foreground hover:text-foreground transition">Scanner</Link>
          <a href="#features" className="text-muted-foreground hover:text-foreground transition" onClick={e => handleNavClick(e, 'features')}>{t.header.nav.features}</a>
          <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition" onClick={e => handleNavClick(e, 'testimonials')}>{t.header.nav.testimonials}</a>
          <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition">{t.header.nav.pricing}</Link>
          <a href="#faq" className="text-muted-foreground hover:text-foreground transition" onClick={e => handleNavClick(e, 'faq')}>{t.header.nav.faq}</a>
        </nav>
        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <>
              <Link href="/profile">
                <Button variant="outline" size="sm">My Profile</Button>
              </Link>
              <Button size="sm" onClick={signOut}>{t.header.nav.logout}</Button>
            </>
          ) : (
            <Button size="sm" onClick={signIn}>{t.header.nav.login}</Button>
          )}
        </div>
      </div>
    </header>
  );
} 