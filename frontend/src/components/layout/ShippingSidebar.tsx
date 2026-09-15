import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Ship,
  Anchor,
  AlertTriangle,
  User,
  LayoutDashboard,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  PlusCircle,
  Clock,
  Layers,
  FileText,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOperations } from '../../context/OperationsContext';

interface ShippingSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
  isMobileDrawer?: boolean;
  onCloseMobileDrawer?: () => void;
}

interface NavGroup {
  group: string;
  items: {
    name: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

export const ShippingSidebar: React.FC<ShippingSidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  isMobileDrawer = false,
  onCloseMobileDrawer,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { berthRequests, unreadAgentAlertsCount } = useOperations();

  const pendingRequestsCount = berthRequests.filter(r => r.status === 'Pending').length;

  const navGroups: NavGroup[] = [
    {
      group: 'Overview',
      items: [
        { name: 'Dashboard', path: '/shipping/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      group: 'Fleet',
      items: [
        { name: 'My Vessels', path: '/shipping/vessels', icon: Ship },
        { name: 'Add Vessel', path: '/shipping/vessels/add', icon: PlusCircle },
      ],
    },
    {
      group: 'Operations',
      items: [
        { name: 'Schedules', path: '/shipping/schedules', icon: Clock },
        {
          name: 'Berth Requests',
          path: '/shipping/berth-requests',
          icon: Anchor,
          badge: pendingRequestsCount > 0 ? String(pendingRequestsCount) : undefined,
        },
        { name: 'Cargo', path: '/shipping/cargo', icon: Layers },
      ],
    },
    {
      group: 'Documents',
      items: [
        { name: 'Documents', path: '/shipping/documents', icon: FileText },
      ],
    },
    {
      group: 'Communication',
      items: [
        {
          name: 'Alerts',
          path: '/shipping/alerts',
          icon: AlertTriangle,
          badge: unreadAgentAlertsCount > 0 ? String(unreadAgentAlertsCount) : undefined,
        },
        { name: 'AI Copilot', path: '/shipping/copilot', icon: Sparkles },
      ],
    },
    {
      group: 'Account',
      items: [
        { name: 'Profile & Settings', path: '/shipping/profile', icon: User },
      ],
    },
  ];

  const handleNavClick = () => {
    if (isMobileDrawer && onCloseMobileDrawer) {
      onCloseMobileDrawer();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const containerClasses = isMobileDrawer
    ? 'fixed bottom-0 left-0 right-0 h-16 bg-surface/90 backdrop-blur-xl border-t border-border-subtle flex flex-row items-center justify-around z-50 shadow-modal md:hidden'
    : `fixed top-0 bottom-0 left-0 z-30 bg-surface/90 backdrop-blur-xl border-r border-border-subtle hidden md:flex flex-col transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
        isCollapsed ? 'w-16' : 'w-64'
      }`;

  if (isMobileDrawer) {
    return (
      <nav className={containerClasses}>
        {navGroups.flatMap(s => s.items).slice(0, 5).map(item => {
          const Icon = item.icon;
          const isActive = item.path === '/shipping/dashboard' ? location.pathname === '/shipping/dashboard' || location.pathname === '/shipping' : location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-sky-600' : 'text-text-muted'}`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-sky-600 fill-sky-600/20' : ''}`} />
              <span className="text-[10px] font-medium">{item.name.split(' ')[0]}</span>
            </NavLink>
          );
        })}
      </nav>
    );
  }

  return (
    <aside className={containerClasses}>
      {/* Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-border-subtle bg-surface shrink-0">
        {!isCollapsed || isMobileDrawer ? (
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <Anchor className="w-4 h-4 shrink-0" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-semibold text-sm tracking-tight text-text-main truncate">
                  PortPulse
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-50 text-sky-800 font-semibold border border-sky-200 shrink-0">
                  AGENT
                </span>
              </div>
              <p className="text-[11px] text-text-muted truncate">
                Shipping Operations
              </p>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center mx-auto shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <Anchor className="w-4 h-4" />
          </div>
        )}

        {/* Toggle / Close Button */}
        {isMobileDrawer ? (
          <button
            onClick={onCloseMobileDrawer}
            className="p-1.5 rounded-xl text-text-muted hover:text-text-main hover:bg-surface-subtle transition-colors"
            title="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        ) : (
          setIsCollapsed && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded-xl text-text-caption hover:text-text-main hover:bg-surface-subtle transition-colors hidden md:block"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )
        )}
      </div>

      {/* Agency Identity Ribbon */}
      {(!isCollapsed || isMobileDrawer) && (
        <div className="px-4 py-2 border-b border-border-subtle bg-surface-subtle/60 shrink-0">
          <div className="flex items-center justify-between text-xs gap-2 min-w-0">
            <span className="text-text-muted truncate flex-1 min-w-0">Apex Maritime Agency</span>
            <span className="font-medium text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 text-[10px] shrink-0">
              Ship Agent
            </span>
          </div>
        </div>
      )}

      {/* Navigation Group Sections */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-3">
        {navGroups.map(group => (
          <div key={group.group} className="space-y-0.5">
            {(!isCollapsed || isMobileDrawer) && (
              <div className="px-2.5 py-1 text-[10px] font-semibold tracking-wider text-text-caption uppercase">
                {group.group}
              </div>
            )}
            {group.items.map(item => {
              const Icon = item.icon;
              const isActive =
                item.path === '/shipping/dashboard'
                  ? location.pathname === '/shipping/dashboard' || location.pathname === '/shipping'
                  : location.pathname === item.path ||
                    (item.path === '/shipping/vessels' && location.pathname.startsWith('/shipping/vessels/') && location.pathname !== '/shipping/vessels/add') ||
                    (item.path !== '/shipping/vessels' && location.pathname.startsWith(item.path));

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  title={isCollapsed && !isMobileDrawer ? item.name : undefined}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 active:scale-[0.98] min-w-0 ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                      : 'text-text-muted hover:text-text-main hover:bg-surface-subtle'
                  } ${isCollapsed && !isMobileDrawer ? 'justify-center px-0' : ''}`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-text-caption'
                    }`}
                  />
                  {(!isCollapsed || isMobileDrawer) && (
                    <span className="truncate flex-1 min-w-0">{item.name}</span>
                  )}
                  {(!isCollapsed || isMobileDrawer) && item.badge && (
                    <span className={`ml-auto px-1.5 py-0.2 rounded-full text-[10px] font-semibold border shrink-0 ${
                      isActive ? 'bg-white/20 text-white border-transparent' : 'bg-sky-100 text-sky-800 border-sky-200'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer / User Profile & Logout */}
      <div className="p-3 border-t border-border-subtle bg-surface space-y-2 shrink-0">
        {!isCollapsed || isMobileDrawer ? (
          <>
            <div className="flex items-center gap-2.5 p-1.5 rounded-lg bg-surface-subtle border border-border-subtle">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-border-subtle shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-sky-100 border border-sky-200 text-sky-800 flex items-center justify-center font-bold text-xs shrink-0">
                  SA
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-text-main truncate">
                  {user?.name || 'Shipping Agent'}
                </div>
                <div className="text-[11px] text-text-muted truncate">
                  {user?.email || 'agent@portpulse.demo'}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center p-2 rounded-xl text-text-caption hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};

