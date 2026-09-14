import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Activity,
  Ship,
  Anchor,
  Cpu,
  Warehouse,
  Calendar,
  ChartNoAxesCombined,
  Sparkles,
  Route,
  Zap,
  RefreshCw,
  Clock,
  BarChart3,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  X,
} from 'lucide-react';
import { useOperations } from '../../context/OperationsContext';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
  isMobileDrawer?: boolean;
  onCloseMobileDrawer?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  isMobileDrawer = false,
  onCloseMobileDrawer,
}) => {
  const location = useLocation();
  const { alerts, isOptimizationApplied, resetToDefault } = useOperations();
  const unreadAlerts = alerts.filter(a => !a.isResolved).length;

  const navSections = [
    {
      label: 'Overview',
      items: [
        { name: 'Command Center', path: '/dashboard', icon: Activity },
      ],
    },
    {
      label: 'Operations',
      items: [
        { name: 'Vessels', path: '/operations/vessels', icon: Ship },
        { name: 'Berths', path: '/operations/berths', icon: Anchor },
        { name: 'Cranes', path: '/operations/cranes', icon: Cpu },
        { name: 'Yard', path: '/operations/yard', icon: Warehouse },
        { name: 'Operations Board', path: '/operations', icon: Calendar },
      ],
    },
    {
      label: 'Intelligence',
      items: [
        { name: 'Congestion Forecast', path: '/intelligence/forecast', icon: ChartNoAxesCombined },
        { name: 'AI Copilot', path: '/copilot', icon: Sparkles },
        { name: 'Route Intelligence', path: '/intelligence/routes', icon: Route },
      ],
    },
    {
      label: 'Decision Support',
      items: [
        { name: 'Optimizer', path: '/decision/optimizer', icon: Zap },
        { name: 'What-If Simulator', path: '/decision/simulator', icon: RefreshCw },
        { name: '72-Hour Planner', path: '/decision/planner', icon: Clock },
      ],
    },
    {
      label: 'Analytics',
      items: [
        { name: 'Analytics', path: '/analytics', icon: BarChart3 },
      ],
    },
    {
      label: 'System',
      items: [
        {
          name: 'Alerts',
          path: '/alerts',
          icon: Bell,
          badge: unreadAlerts > 0 ? unreadAlerts : undefined,
          badgeColor: 'bg-rose-100 text-rose-700 font-semibold',
        },
        { name: 'Settings', path: '/settings', icon: Settings },
      ],
    },
  ];

  const handleNavClick = () => {
    if (isMobileDrawer && onCloseMobileDrawer) {
      onCloseMobileDrawer();
    }
  };

  const containerClasses = isMobileDrawer
    ? 'fixed bottom-0 left-0 right-0 h-16 bg-surface/90 backdrop-blur-xl border-t border-border-subtle flex flex-row items-center justify-around z-50 shadow-modal md:hidden'
    : `fixed top-0 bottom-0 left-0 z-30 bg-surface/90 backdrop-blur-xl border-r border-border-subtle hidden md:flex flex-col transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
        isCollapsed ? 'w-16' : 'w-64'
      }`;

  if (isMobileDrawer) {
    return (
      <nav className={containerClasses}>
        {navSections.flatMap(s => s.items).slice(0, 5).map(item => {
          const Icon = item.icon;
          const isActive = item.path === '/operations' ? location.pathname === '/operations' : location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-brand-blue' : 'text-text-muted'}`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-brand-blue fill-brand-blue/20' : ''}`} />
              <span className="text-[10px] font-medium">{item.name.split(' ')[0]}</span>
            </NavLink>
          );
        })}
      </nav>
    );
  }

  return (
    <aside className={containerClasses}>
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-border-subtle bg-surface/80 backdrop-blur-md shrink-0">
        {!isCollapsed || isMobileDrawer ? (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-brand-teal text-white flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(20,184,166,0.3)]">
              <Ship className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm tracking-tight text-text-main">
                  PortPulse
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-teal-50 text-teal-800 font-semibold border border-teal-200 shadow-xs">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-text-muted truncate">
                Operations Platform
              </p>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-xl bg-brand-teal text-white flex items-center justify-center mx-auto shadow-[0_2px_8px_rgba(20,184,166,0.3)]">
            <Ship className="w-4 h-4" />
          </div>
        )}

        {/* Action button: Close X on mobile, Toggle Chevron on desktop/tablet */}
        {isMobileDrawer ? (
          <button
            onClick={onCloseMobileDrawer}
            className="p-1.5 rounded-full text-text-muted hover:text-text-main hover:bg-surface-subtle transition-colors"
            title="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        ) : (
          setIsCollapsed && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded-full text-text-caption hover:text-text-main hover:bg-surface-subtle transition-colors"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )
        )}
      </div>

      {/* Port Operational Status Ribbon */}
      {(!isCollapsed || isMobileDrawer) && (
        <div className="px-4 py-2 border-b border-border-subtle bg-surface-subtle/60 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isOptimizationApplied ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                }`}
              />
              <span className="text-xs font-medium text-text-main">
                {isOptimizationApplied ? 'Port: Balanced' : 'Risk Detected'}
              </span>
            </div>
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                isOptimizationApplied
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {isOptimizationApplied ? 'Optimized' : 'B04 Warning'}
            </span>
          </div>
        </div>
      )}

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {(!isCollapsed || isMobileDrawer) && (
              <h3 className="px-3 pb-1 text-[11px] font-semibold text-text-caption uppercase tracking-wider">
                {section.label}
              </h3>
            )}
            <div className="space-y-1">
              {section.items.map(item => {
                const Icon = item.icon;
                const isActive =
                  item.path === '/operations'
                    ? location.pathname === '/operations'
                    : location.pathname.startsWith(item.path);

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={handleNavClick}
                    title={isCollapsed && !isMobileDrawer ? item.name : undefined}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all duration-200 ease-out ${
                      isActive
                        ? 'bg-brand-teal/10 text-brand-teal font-semibold'
                        : 'text-text-muted hover:text-text-main hover:bg-surface-subtle'
                    } ${isCollapsed && !isMobileDrawer ? 'justify-center px-0 mx-2' : ''}`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-brand-teal' : 'text-text-caption'
                      }`}
                    />
                    {(!isCollapsed || isMobileDrawer) && <span className="truncate">{item.name}</span>}
                    {(!isCollapsed || isMobileDrawer) && item.badge && (
                      <span
                        className={`ml-auto px-2 py-0.5 rounded-full text-[10px] ${item.badgeColor} shadow-xs`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer / Demo Reset & Profile */}
      <div className="p-4 border-t border-border-subtle bg-surface/80 backdrop-blur-md space-y-3 shrink-0">
        {!isCollapsed || isMobileDrawer ? (
          <>
            <button
              onClick={resetToDefault}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-text-main bg-surface hover:bg-surface-subtle border border-border-subtle transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] active:scale-95"
              title="Reset simulation to initial state"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo State</span>
            </button>
            <div className="flex items-center gap-3 pt-2 px-1">
              <div className="w-8 h-8 rounded-full bg-surface-subtle border border-border-subtle flex items-center justify-center text-xs font-semibold text-text-main shrink-0 shadow-xs">
                MV
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-text-main truncate">Capt. M. Vance</div>
                <div className="text-[11px] text-text-muted truncate">Port Supervisor</div>
              </div>
            </div>
          </>
        ) : (
          <button
            onClick={resetToDefault}
            className="w-full flex items-center justify-center p-2 rounded-xl text-text-caption hover:text-text-main hover:bg-surface-subtle transition-colors shadow-xs active:scale-95"
            title="Reset Demo State"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};
