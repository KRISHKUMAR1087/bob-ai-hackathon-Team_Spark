import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Sparkles,
  Clock,
  Menu,
  ChevronRight,
} from 'lucide-react';
import { useOperations } from '../../context/OperationsContext';

interface TopbarProps {
  isCollapsed: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export const Topbar: React.FC<TopbarProps> = ({ isCollapsed, setIsMobileMenuOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { alerts, isOptimizationApplied, setIsCopilotOpen, isCopilotOpen, searchQuery, setSearchQuery } = useOperations();
  const [timeUtc, setTimeUtc] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeUtc(
        now.toISOString().slice(11, 19) + ' UTC'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const unreadAlerts = alerts.filter(a => !a.isResolved).length;

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return { section: 'Overview', title: 'Command Center' };
    if (path.includes('/operations/vessels')) return { section: 'Operations', title: 'Vessel Traffic' };
    if (path.includes('/operations/berths')) return { section: 'Operations', title: 'Berths Utilization' };
    if (path.includes('/operations/cranes')) return { section: 'Operations', title: 'Cranes Fleet' };
    if (path.includes('/operations/yard')) return { section: 'Operations', title: 'Yard Capacity' };
    if (path === '/operations' || path.includes('/operations/board')) return { section: 'Operations', title: 'Operations Board' };
    if (path.includes('/intelligence/forecast')) return { section: 'Intelligence', title: 'Congestion Forecast' };
    if (path.includes('/copilot')) return { section: 'Intelligence', title: 'Gemini Copilot' };
    if (path.includes('/intelligence/routes')) return { section: 'Intelligence', title: 'Route Intelligence' };
    if (path.includes('/decision/optimizer')) return { section: 'Decision Support', title: 'Optimizer' };
    if (path.includes('/decision/simulator')) return { section: 'Decision Support', title: 'What-If Simulator' };
    if (path.includes('/decision/planner')) return { section: 'Decision Support', title: '72-Hour Planner' };
    if (path.includes('/analytics')) return { section: 'Analytics', title: 'Operations Analytics' };
    if (path.includes('/alerts')) return { section: 'System', title: 'Operational Alerts' };
    if (path.includes('/settings')) return { section: 'System', title: 'Settings' };
    return { section: 'PortPulse', title: 'Command Center' };
  };

  const breadcrumb = getBreadcrumb();

  return (
    <header
      className={`fixed top-0 right-0 z-20 h-16 bg-surface border-b border-border-subtle transition-all duration-200 flex items-center justify-between px-4 lg:px-6 ${
        isCollapsed ? 'left-16' : 'left-0 lg:left-64'
      }`}
    >
      {/* Left: Mobile Toggle + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-1.5 rounded-md text-text-muted hover:text-text-main hover:bg-surface-subtle lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <span>{breadcrumb.section}</span>
          <ChevronRight className="w-3.5 h-3.5 text-text-caption" />
          <span className="text-text-main font-semibold truncate">{breadcrumb.title}</span>
        </div>
      </div>

      {/* Right Actions & Utilities */}
      <div className="flex items-center gap-3">
        {/* Global Search */}
        <div className="relative hidden md:block">
          <div className="flex items-center bg-surface-subtle border border-border-subtle rounded-md px-2.5 py-1.5 w-48 lg:w-60 focus-within:border-brand-teal focus-within:w-68 transition-all">
            <Search className="w-3.5 h-3.5 text-text-caption mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search vessel, berth, IMO..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-text-main placeholder-text-caption focus:outline-hidden"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-text-caption hover:text-text-main text-[10px] ml-1"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Live Port UTC Clock */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-subtle border border-border-subtle text-text-muted text-xs">
          <Clock className="w-3.5 h-3.5 text-text-caption" />
          <span className="font-mono">{timeUtc || '00:00:00 UTC'}</span>
        </div>

        {/* AIS Status */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-subtle border border-border-subtle text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-text-muted">AIS:</span>
          <span className="text-text-main font-medium">Online</span>
        </div>

        {/* Alerts Bell */}
        <button
          onClick={() => navigate('/alerts')}
          className="relative p-2 rounded-md text-text-muted hover:text-text-main hover:bg-surface-subtle border border-transparent hover:border-border-subtle transition-colors"
          title={`${unreadAlerts} Active Operational Alerts`}
        >
          <Bell className="w-4 h-4" />
          {unreadAlerts > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
          )}
        </button>

        {/* Copilot Trigger Button */}
        <button
          onClick={() => setIsCopilotOpen(!isCopilotOpen)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 border ${
            isCopilotOpen
              ? 'bg-brand-teal text-white border-brand-teal'
              : 'bg-surface text-text-main border-border-subtle hover:bg-surface-subtle hover:border-slate-300'
          }`}
          title="Open Gemini Operational Copilot"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isCopilotOpen ? 'text-white' : 'text-brand-teal'}`} />
          <span className="hidden sm:inline">Copilot</span>
        </button>

        {/* Supervisor Profile Avatar */}
        <div
          onClick={() => navigate('/settings')}
          className="w-8 h-8 rounded-full bg-surface-subtle border border-border-subtle flex items-center justify-center text-xs font-semibold text-text-main cursor-pointer hover:border-slate-300 transition-colors"
          title="Capt. M. Vance — Port Supervisor"
        >
          MV
        </div>
      </div>
    </header>
  );
};
