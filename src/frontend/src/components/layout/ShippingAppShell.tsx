import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ShippingSidebar } from './ShippingSidebar';
import { ShippingTopbar } from './ShippingTopbar';
import { ToastNotification } from '../common/ToastNotification';

export const ShippingAppShell: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const location = useLocation();

  // Responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setIsSidebarCollapsed(false);
      } else if (width < 1200) {
        setIsSidebarCollapsed(true);
      } else {
        setIsSidebarCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile off-canvas drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-canvas text-text-main flex flex-col w-full overflow-x-hidden">
      {/* 1. Desktop & Tablet Sticky Sidebar */}
      <ShippingSidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* 2. Mobile Off-Canvas Navigation Drawer (< 768px) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-in fade-in duration-200">
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            aria-label="Close navigation backdrop"
          />
          <div className="relative z-10 animate-in slide-in-from-left duration-300 h-full">
            <ShippingSidebar
              isCollapsed={false}
              isMobileDrawer={true}
              onCloseMobileDrawer={() => setIsMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* 3. Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-200 min-w-0 w-full ${
          isSidebarCollapsed ? 'md:pl-16' : 'md:pl-64'
        }`}
      >
        <ShippingTopbar
          isCollapsed={isSidebarCollapsed}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        {/* Dynamic Page Container: Responsive padding */}
        <main className="flex-1 mt-16 p-4 pb-20 md:pb-4 sm:p-6 lg:p-8 min-w-0 w-full overflow-x-hidden">
          <div className="max-w-7xl mx-auto space-y-6 min-w-0 w-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Operational Toasts */}
      <ToastNotification />
    </div>
  );
};
