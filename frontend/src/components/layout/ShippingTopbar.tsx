import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Bell,
  Clock,
  Menu,
  ChevronRight,
  LogOut,
  User as UserIcon,
  Ship,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOperations } from '../../context/OperationsContext';
import { MusicButton } from '../common/MusicButton';
import { ThemeToggleButton } from '../common/ThemeToggleButton';

interface ShippingTopbarProps {
  isCollapsed: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export const ShippingTopbar: React.FC<ShippingTopbarProps> = ({
  isCollapsed,
  setIsMobileMenuOpen,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isOptimizationApplied } = useOperations();
  const [timeUtc, setTimeUtc] = useState<string>('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeUtc(now.toISOString().slice(11, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path.includes('/shipping/dashboard')) return { section: 'Shipping Portal', title: 'Agency Overview' };
    if (path.includes('/shipping/vessels/')) return { section: 'Vessel Tracking', title: 'Turnaround Details' };
    if (path.includes('/shipping/vessels')) return { section: 'Shipping Portal', title: 'Assigned Fleet' };
    if (path.includes('/shipping/alerts')) return { section: 'Shipping Portal', title: 'Port Advisories' };
    if (path.includes('/shipping/profile')) return { section: 'Shipping Portal', title: 'Agency Profile' };
    return { section: 'Shipping Portal', title: 'Overview' };
  };

  const breadcrumb = getBreadcrumb();

  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    logout();
    navigate('/', { replace: true });
  };

  return (
    <header
      className={`fixed top-0 right-0 z-20 h-16 bg-surface border-b border-border-subtle transition-all duration-200 flex items-center justify-between px-3 sm:px-4 lg:px-6 left-0 ${
        isCollapsed ? 'md:left-16' : 'md:left-64'
      }`}
    >
      {/* Left: Mobile Toggle + Breadcrumb */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Hamburger Menu: visible only on mobile (< 768px) */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-1.5 rounded-md text-text-muted hover:text-text-main hover:bg-surface-subtle md:hidden shrink-0"
          aria-label="Open navigation menu"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 text-xs text-text-muted min-w-0">
          <span className="hidden sm:inline shrink-0">{breadcrumb.section}</span>
          <ChevronRight className="w-3.5 h-3.5 text-text-caption hidden sm:inline shrink-0" />
          <span className="text-text-main font-semibold truncate text-xs sm:text-sm">
            {breadcrumb.title}
          </span>
        </div>
      </div>

      {/* Right Actions & Utilities */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Live Port UTC Clock */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-subtle border border-border-subtle text-text-muted text-xs shrink-0">
          <Clock className="w-3.5 h-3.5 text-text-caption shrink-0" />
          <span className="font-mono text-[11px]">{timeUtc || '00:00:00 UTC'}</span>
        </div>

        {/* Port Link / Status Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-50 border border-sky-200 text-sky-800 text-xs shrink-0">
          <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
          <span className="font-medium text-[11px]">Port Authority Link Active</span>
        </div>

        {/* Shipping Advisories Bell */}
        <button
          onClick={() => navigate('/shipping/alerts')}
          className="relative p-1.5 sm:p-2 rounded-md text-text-muted hover:text-text-main hover:bg-surface-subtle border border-transparent hover:border-border-subtle transition-colors shrink-0"
          title={isOptimizationApplied ? 'All schedules normal' : '1 Active delay advisory'}
        >
          <Bell className="w-4 h-4" />
          {!isOptimizationApplied && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          )}
        </button>

        {/* Ambient Background Music Toggle */}
        <MusicButton />

        {/* Day / Night Theme Switcher */}
        <ThemeToggleButton />

        {/* Agent Profile Dropdown Container */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-full sm:rounded-md hover:bg-surface-subtle transition-colors border border-transparent hover:border-border-subtle cursor-pointer"
            aria-label="User profile menu"
            aria-expanded={isProfileMenuOpen}
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border border-border-subtle shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-sky-100 border border-sky-200 text-sky-800 flex items-center justify-center font-bold text-xs shrink-0">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'SA'}
              </div>
            )}
            <div className="hidden sm:block text-left pr-1">
              <div className="text-xs font-semibold text-text-main leading-tight truncate max-w-[120px]">
                {user?.name || 'Shipping Agent'}
              </div>
              <div className="text-[10px] text-text-muted leading-tight">
                Ship Agent
              </div>
            </div>
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-surface border border-border-subtle shadow-modal py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* User Identity Header */}
              <div className="px-4 py-2.5 border-b border-border-subtle">
                <div className="text-xs font-semibold text-text-main truncate">
                  {user?.name || 'Shipping Agent'}
                </div>
                <div className="text-[11px] text-text-muted truncate mt-0.5">
                  {user?.email || 'agent@portpulse.demo'}
                </div>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-50 text-sky-800 border border-sky-200">
                  <Ship className="w-3 h-3 text-sky-600" />
                  Role: Ship Agent
                </div>
              </div>

              {/* Menu Links */}
              <div className="py-1">
                <Link
                  to="/shipping/profile"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs text-text-main hover:bg-surface-subtle transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5 text-text-caption" />
                  <span>Agency Profile & Settings</span>
                </Link>
                <Link
                  to="/shipping/vessels"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs text-text-main hover:bg-surface-subtle transition-colors"
                >
                  <Ship className="w-3.5 h-3.5 text-text-caption" />
                  <span>Assigned Fleet (4)</span>
                </Link>
              </div>

              {/* Sign Out Divider & Button */}
              <div className="border-t border-border-subtle pt-1 mt-1 px-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium text-rose-700 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
