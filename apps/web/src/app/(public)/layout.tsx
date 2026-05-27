import React from 'react';
import { Navbar } from '@/components/layout/navbar';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col min-h-screen pt-20">
        {children}
      </main>
    </>
  );
}
