/**
 * DriveSafe AI — Main Application Entry Point
 * Phase 1: Project Architecture, UI/UX, and Professional Web Foundation
 */

import React from 'react';
import { DriveSafeProvider, useDriveSafe } from './context/DriveSafeContext';
import { Navigation } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { MonitorView } from './components/MonitorView';
import { SessionsView } from './components/SessionsView';
import { SettingsView } from './components/SettingsView';
import { AboutView } from './components/AboutView';
import { DrowsinessAlertModal } from './components/DrowsinessAlertModal';
import { ErrorStatesPanel } from './components/ErrorStatesPanel';
import { GraduationCap, ShieldAlert, Heart } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentTab } = useDriveSafe();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Navigation Header */}
      <Navigation />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentTab === 'dashboard' && (
          <div className="space-y-8">
            <DashboardView />
            <ErrorStatesPanel />
          </div>
        )}

        {currentTab === 'monitor' && <MonitorView />}

        {currentTab === 'sessions' && <SessionsView />}

        {currentTab === 'settings' && <SettingsView />}

        {currentTab === 'about' && <AboutView />}
      </main>

      {/* Drowsiness Alert Overlay Modal */}
      <DrowsinessAlertModal />

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950/80 py-6 mt-12 text-slate-500 text-xs font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-emerald-400" />
            <span>DriveSafe AI • BCA Final Year Project Prototype • Phase 1</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Educational Prototype — Not a certified safety system</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <DriveSafeProvider>
      <AppContent />
    </DriveSafeProvider>
  );
}
