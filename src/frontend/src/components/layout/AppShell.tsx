import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastNotification } from '../common/ToastNotification';
import { CopilotDrawer } from '../copilot/CopilotDrawer';

export const AppShell: React.FC = () => {
  const [isPinned, setIsPinned] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const location = useLocation();

  // Automatically close mobile off-canvas drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-canvas text-text-main flex flex-col w-full overflow-x-hidden">
      {/* 1. Desktop & Tablet Static/Sticky Sidebar (hidden on mobile < 768px) */}
      <Sidebar
        isPinned={isPinned}
        setIsPinned={setIsPinned}
      />

      {/* 2. Mobile Off-Canvas Navigation Drawer (< 768px) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-in fade-in duration-200">
          {/* Dark Backdrop */}
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            aria-label="Close navigation backdrop"
          />

          {/* Sliding Drawer Container */}
          <div className="relative z-10 animate-in slide-in-from-left duration-300 h-full">
            <Sidebar
              isPinned={true}
              isMobileDrawer={true}
              onCloseMobileDrawer={() => setIsMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* 3. Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 min-w-0 w-full ${
          isPinned ? 'md:pl-64' : 'md:pl-16'
        }`}
      >
        <Topbar
          isCollapsed={!isPinned}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        {/* Dynamic Page Container: Responsive padding (p-4 pb-20 on mobile, p-6 on tablet, p-8 on desktop) */}
        <main className="flex-1 mt-16 p-4 pb-20 md:pb-4 sm:p-6 lg:p-8 min-w-0 w-full overflow-x-hidden">
          <div className="max-w-7xl mx-auto space-y-6 min-w-0 w-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Slide-Over Copilot */}
      <CopilotDrawer />

      {/* Global Operational Toasts */}
      <ToastNotification />
    </div>
  );
};
