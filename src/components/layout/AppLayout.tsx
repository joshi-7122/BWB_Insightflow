import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { PageTransition } from './PageTransition';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#080b11] text-slate-100 antialiased">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
    </div>
  );
};
