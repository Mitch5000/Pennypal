import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { View } from '../../types';
import {
  LayoutDashboard, ArrowLeftRight, BarChart3, FileText,
  Settings, LogOut, ChevronLeft, ChevronRight, X,
} from 'lucide-react';
import Logo from '../Logo';

interface NavItem {
  id: View;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'transactions', label: 'Transactions', icon: <ArrowLeftRight className="w-5 h-5" /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
  { id: 'reports', label: 'Reports', icon: <FileText className="w-5 h-5" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
];

interface Props {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<Props> = ({ mobileOpen, onCloseMobile }) => {
  const { currentView, setCurrentView, user, logout } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || 'U';

  const go = (id: View) => {
    setCurrentView(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed lg:relative inset-y-0 left-0 z-50 flex flex-col h-full w-72 bg-surface border-r border-line
          transition-transform duration-300 lg:transition-[width] lg:duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
          ${collapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 p-6 border-b border-line ${collapsed ? 'lg:justify-center lg:px-4' : ''}`}>
          <div className="w-9 h-9 bg-copper rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm shadow-black/10">
            <Logo size={20} />
          </div>
          <span className={`text-xl font-bold text-ink tracking-tight font-display ${collapsed ? 'lg:hidden' : ''}`}>PennyPal</span>
          <button
            onClick={onCloseMobile}
            className="ml-auto lg:hidden p-1.5 rounded-lg hover:bg-fill text-muted"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => go(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                collapsed ? 'lg:justify-center' : ''
              } ${
                currentView === item.id
                  ? 'bg-copper/10 text-copper-deep border border-copper/20'
                  : 'text-muted hover:text-ink hover:bg-fill'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <span className={`flex-shrink-0 ${currentView === item.id ? 'text-copper' : ''}`}>
                {item.icon}
              </span>
              <span className={`text-sm font-medium ${collapsed ? 'lg:hidden' : ''}`}>{item.label}</span>
              {currentView === item.id && (
                <div className={`ml-auto w-1.5 h-1.5 bg-copper rounded-full ${collapsed ? 'lg:hidden' : ''}`} />
              )}
            </button>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="p-4 border-t border-line">
          <div className={`flex items-center gap-3 px-3 py-3 mb-1 ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}>
            <div className="w-8 h-8 bg-copper/15 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-copper-deep">{initials}</span>
            </div>
            <div className={`flex-1 min-w-0 ${collapsed ? 'lg:hidden' : ''}`}>
              <p className="text-sm font-medium text-ink truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-faint truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => { void logout(); onCloseMobile(); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted hover:text-terra hover:bg-terra/10 transition-all duration-200 ${
              collapsed ? 'lg:justify-center' : ''
            }`}
            title={collapsed ? 'Sign Out' : undefined}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span className={`text-sm ${collapsed ? 'lg:hidden' : ''}`}>Sign Out</span>
          </button>
        </div>

        {/* Collapse toggle - desktop only */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-8 w-6 h-6 bg-fill border border-line-strong rounded-full items-center justify-center text-muted hover:text-ink hover:bg-fill-strong transition-all z-10 hidden lg:flex"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>
    </>
  );
};
