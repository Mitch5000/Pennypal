import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { AppProvider, useApp } from './context/AppContext';
import { AuthPage } from './components/auth/AuthPage';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/dashboard/Dashboard';
import { Transactions } from './components/transactions/Transactions';
import { Analytics } from './components/analytics/Analytics';
import { Reports } from './components/reports/Reports';
import { Settings } from './components/settings/Settings';

const AppContent: React.FC = () => {
  const { user, authLoading, currentView } = useApp();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [noteHidden, setNoteHidden] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-copper/30 border-t-copper rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted text-sm">Loading PennyPal...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const isDemoMode = !(import.meta as unknown as { env: Record<string, string> }).env?.VITE_SUPABASE_URL ||
    (import.meta as unknown as { env: Record<string, string> }).env?.VITE_SUPABASE_URL === 'https://placeholder.supabase.co';

  return (
    <div className="flex h-screen bg-canvas overflow-hidden">
      <Sidebar mobileOpen={mobileNavOpen} onCloseMobile={() => setMobileNavOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {isDemoMode && !noteHidden && (
          <div className="relative bg-copper/[0.08] border-b border-copper/15 px-4 sm:px-6 py-1.5 flex items-center justify-center">
            <span className="text-copper-deep text-[11px] sm:text-xs text-center">Demo mode · your changes are saved in this browser</span>
            <button
              onClick={() => setNoteHidden(true)}
              aria-label="Dismiss"
              className="absolute right-2 sm:right-4 text-copper-deep/50 hover:text-copper-deep p-1 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        <Header onOpenMobile={() => setMobileNavOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-canvas">
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'transactions' && <Transactions />}
          {currentView === 'analytics' && <Analytics />}
          {currentView === 'reports' && <Reports />}
          {currentView === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#fffdf8',
            color: '#241f18',
            border: '1px solid #e6dfd2',
            borderRadius: '12px',
            fontSize: '13px',
            fontFamily: 'Inter, sans-serif',
          },
          success: {
            iconTheme: { primary: '#2f6f4f', secondary: '#fffdf8' },
          },
          error: {
            iconTheme: { primary: '#b4553c', secondary: '#fffdf8' },
          },
        }}
      />
      <AppContent />
    </AppProvider>
  );
};

export default App;
