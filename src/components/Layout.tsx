import { ReactNode } from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  children: ReactNode;
  showNavbar?: boolean;
}

export default function Layout({ children, showNavbar = true }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-900">
      {showNavbar && <Navbar />}
      <main className={showNavbar ? 'pt-16' : ''}>
        {children}
      </main>
    </div>
  );
}