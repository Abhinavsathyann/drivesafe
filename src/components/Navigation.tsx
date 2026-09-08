import React, { useState } from 'react';
import {
  ShieldAlert,
  LayoutDashboard,
  Video,
  BarChart3,
  Settings,
  Info,
  Play,
  Square,
  Menu,
  X,
  GraduationCap,
} from 'lucide-react';
import { useDriveSafe } from '../context/DriveSafeContext';
import { NavigationTab } from '../types/drivesafe';
import { StatusBadge } from './StatusBadge';

export const Navigation: React.FC = () => {
  const { currentTab, setCurrentTab, state, startMonitoring, stopMonitoring } = useDriveSafe();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: Array<{ id: NavigationTab; label: string; icon: React.ElementType }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'monitor', label: 'Monitor', icon: Video },
    { id: 'sessions', label: 'Sessions', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'about', label: 'About', icon: Info },
  ];

  const handleToggleMonitoring = () => {
    if (state.monitoring) {
      stopMonitoring();
    } else {
      startMonitoring();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Academic Project Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className="flex items-center gap-2.5 text-left transition-opacity hover:opacity-90"
            aria-label="DriveSafe AI Home"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-emerald-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-white font-mono">
                  DriveSafe<span className="text-emerald-400">AI</span>
                </span>
                <span className="inline-flex items-center gap-1 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-300 font-mono">
                  PHASE 1
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Real-Time Driver Drowsiness Monitoring
              </p>
            </div>
          </button>

          <div className="hidden lg:flex items-center gap-1.5 pl-3 border-l border-slate-800 text-xs text-slate-400">
            <GraduationCap className="h-4 w-4 text-emerald-400" />
            <span>BCA Final Year Project</span>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-white font-semibold shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Primary CTA & Status */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="hidden xl:block">
            <StatusBadge type="drowsiness" status={state.drowsinessRisk} size="sm" />
          </div>

          <button
            id="main-nav-cta"
            onClick={handleToggleMonitoring}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md uppercase tracking-wider font-mono transition-all duration-200 shadow-sm ${
              state.monitoring
                ? 'bg-red-600/90 text-white hover:bg-red-700 border border-red-500 focus:ring-2 focus:ring-red-500/50'
                : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold focus:ring-2 focus:ring-emerald-400/50'
            }`}
          >
            {state.monitoring ? (
              <>
                <Square className="h-3.5 w-3.5 fill-current" />
                <span>STOP MONITORING</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>START MONITORING</span>
              </>
            )}
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            id="mobile-nav-cta"
            onClick={handleToggleMonitoring}
            className={`p-2 rounded-md font-mono text-xs ${
              state.monitoring ? 'bg-red-600 text-white' : 'bg-emerald-500 text-slate-950 font-bold'
            }`}
            aria-label={state.monitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          >
            {state.monitoring ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950 px-4 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md ${
                  isActive ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:bg-slate-900'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-2 border-t border-slate-800 flex justify-between items-center px-1">
            <span className="text-xs text-slate-500 font-mono">System State</span>
            <StatusBadge type="drowsiness" status={state.drowsinessRisk} size="sm" />
          </div>
        </div>
      )}
    </header>
  );
};
