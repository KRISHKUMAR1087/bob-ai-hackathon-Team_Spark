import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Check,
  Filter,
} from 'lucide-react';
import { useOperations } from '../../context/OperationsContext';

interface AgentAlertItem {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'WARNING' | 'OPERATIONAL';
  category: string;
  timestamp: string;
  description: string;
  vesselId: string;
  vesselName: string;
  actionLabel: string;
  isRead: boolean;
  isResolved: boolean;
}

export const ShippingAlertsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isOptimizationApplied } = useOperations();
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'CRITICAL' | 'OPERATIONAL'>('ALL');

  // Dynamic alerts list reflecting live port state
  const [alertsList, setAlertsList] = useState<AgentAlertItem[]>([
    {
      id: 'ALT-AG-01',
      title: isOptimizationApplied
        ? 'Berth Re-assignment Confirmed: Ocean Star → Berth B02'
        : 'Berth Congestion Warning: Berth B04 at 94% Capacity',
      severity: isOptimizationApplied ? 'OPERATIONAL' : 'CRITICAL',
      category: 'Berthing & Crane Allocation',
      timestamp: '15 mins ago',
      description: isOptimizationApplied
        ? 'Ocean Star has been reallocated from Berth B04 to Berth B02 with 4 STS cranes. Estimated waiting time reduced from 11.4h to 6.8 hours.'
        : 'Berth B04 is expected to reach 94% utilization within 24 hours. Expected waiting time for Ocean Star escalated to 11.4 hours.',
      vesselId: 'VES-01',
      vesselName: 'Ocean Star',
      actionLabel: 'View Ocean Star',
      isRead: false,
      isResolved: isOptimizationApplied,
    },
    {
      id: 'ALT-AG-02',
      title: 'Ocean Star ETA Adjusted',
      severity: 'OPERATIONAL',
      category: 'Voyage Schedule',
      timestamp: '42 mins ago',
      description: 'Expected arrival has moved to today 14:30 UTC due to eastern approach channel tidal squall. Downstream gang allocation preserved.',
      vesselId: 'VES-01',
      vesselName: 'Ocean Star',
      actionLabel: 'Inspect Schedule',
      isRead: false,
      isResolved: true,
    },
    {
      id: 'ALT-AG-03',
      title: 'Missing Document: Advance Arrival Notice (72h)',
      severity: 'WARNING',
      category: 'Customs & Port Clearance',
      timestamp: '1 hour ago',
      description: 'Pacific Voyager is approaching outer anchorage. Required advance arrival declaration not yet received by port authority customs desk.',
      vesselId: 'VES-05',
      vesselName: 'Pacific Voyager',
      actionLabel: 'Upload Notice',
      isRead: false,
      isResolved: false,
    },
    {
      id: 'ALT-AG-04',
      title: 'Discharge Productivity Normal: MSC Orion',
      severity: 'OPERATIONAL',
      category: 'Cargo Handling',
      timestamp: '2 hours ago',
      description: 'Berth B01 STS crane gangs operating at 31 moves/hour. Estimated vessel completion on schedule for 22:30 UTC departure.',
      vesselId: 'VES-02',
      vesselName: 'MSC Orion',
      actionLabel: 'View Progress',
      isRead: true,
      isResolved: true,
    },
  ]);

  const toggleRead = (id: string) => {
    setAlertsList(prev =>
      prev.map(a => (a.id === id ? { ...a, isRead: !a.isRead } : a))
    );
  };

  const markAllRead = () => {
    setAlertsList(prev => prev.map(a => ({ ...a, isRead: true })));
  };

  const filtered = alertsList.filter(a => {
    if (filter === 'ALL') return true;
    if (filter === 'UNREAD') return !a.isRead;
    if (filter === 'CRITICAL') return a.severity === 'CRITICAL';
    if (filter === 'OPERATIONAL') return a.severity === 'OPERATIONAL' || a.severity === 'WARNING';
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-text-main">
              Fleet Alerts & Advisories
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200">
              Agency Notifications
            </span>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Real-time advisories regarding arrival adjustments, berth reallocations, and documentation deadlines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={markAllRead}
            className="px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-subtle border border-border-subtle text-xs font-medium text-text-main transition-colors cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            Mark All as Read
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface p-3.5 rounded-lg border border-border-subtle shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-text-muted mr-1 font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-text-caption" /> Filter:
          </span>
          {(['ALL', 'UNREAD', 'CRITICAL', 'OPERATIONAL'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                filter === tab
                  ? 'bg-sky-600 text-white font-semibold'
                  : 'bg-surface-subtle text-text-muted hover:text-text-main hover:bg-slate-200'
              }`}
            >
              {tab === 'ALL'
                ? 'All Alerts'
                : tab === 'UNREAD'
                ? 'Unread'
                : tab === 'CRITICAL'
                ? 'Critical'
                : 'Operational'}
            </button>
          ))}
        </div>

        <div className="text-xs text-text-muted">
          Showing <strong className="text-text-main">{filtered.length}</strong> alerts
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filtered.map(alert => (
          <div
            key={alert.id}
            className={`p-5 rounded-lg border shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all bg-surface ${
              !alert.isRead ? 'border-sky-300 bg-sky-50/10' : 'border-border-subtle'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex items-start gap-3.5">
                <div
                  className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                    alert.severity === 'CRITICAL'
                      ? 'bg-rose-100 text-rose-700'
                      : alert.severity === 'WARNING'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-sky-50 text-sky-700'
                  }`}
                >
                  {alert.severity === 'CRITICAL' ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : alert.severity === 'WARNING' ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-sm text-text-main">{alert.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-surface-subtle border border-border-subtle text-text-muted font-medium">
                      {alert.category}
                    </span>
                    {!alert.isRead && (
                      <span className="w-2 h-2 rounded-full bg-sky-600" title="Unread" />
                    )}
                  </div>

                  <p className="text-xs text-text-muted leading-relaxed max-w-3xl">
                    {alert.description}
                  </p>

                  <div className="flex items-center gap-3 pt-1 text-[11px] text-text-caption">
                    <span className="font-medium text-text-main">{alert.vesselName}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {alert.timestamp}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                <button
                  onClick={() => toggleRead(alert.id)}
                  className="p-1.5 rounded-xl hover:bg-surface-subtle text-text-caption hover:text-text-main transition-colors cursor-pointer text-xs"
                  title={alert.isRead ? 'Mark as unread' : 'Mark as read'}
                >
                  <Check className={`w-4 h-4 ${alert.isRead ? 'text-emerald-600' : 'text-text-caption'}`} />
                </button>
                <button
                  onClick={() => navigate(`/shipping/vessels/${alert.vesselId}`)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                >
                  <span>{alert.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

