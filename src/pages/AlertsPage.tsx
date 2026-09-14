import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  ArrowRight,
  Check,
} from 'lucide-react';
import { useOperations } from '../context/OperationsContext';
import { StatusBadge } from '../components/common/StatusBadge';

export const AlertsPage: React.FC = () => {
  const navigate = useNavigate();
  const { alerts, resolveAlert } = useOperations();
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const filteredAlerts = alerts.filter(a => {
    if (filterSeverity === 'ALL') return true;
    if (filterSeverity === 'RESOLVED') return a.isResolved;
    if (filterSeverity === 'CRITICAL') return a.severity === 'CRITICAL' && !a.isResolved;
    if (filterSeverity === 'HIGH' || filterSeverity === 'WARNING')
      return (a.severity === 'HIGH' || a.severity === 'MEDIUM') && !a.isResolved;
    if (filterSeverity === 'INFO') return a.severity === 'INFO' && !a.isResolved;
    return true;
  });

  const getAlertBorder = (severity: string, isResolved: boolean) => {
    if (isResolved) return 'border-border-subtle opacity-60 bg-surface-subtle/30';
    switch (severity) {
      case 'CRITICAL':
        return 'border-rose-200 bg-rose-50/20';
      case 'HIGH':
        return 'border-amber-200 bg-amber-50/20';
      case 'MEDIUM':
        return 'border-amber-200/60 bg-surface';
      default:
        return 'border-border-subtle bg-surface';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main tracking-tight">
            Operational Alert Center
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Real-time equipment telemetry, predictive congestion alerts, and stevedore escalations.
          </p>
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex items-center bg-surface-subtle p-1 rounded-md border border-border-subtle">
          {['ALL', 'CRITICAL', 'WARNING', 'INFO', 'RESOLVED'].map(sev => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1 text-xs rounded-md transition-all ${
                filterSeverity === sev
                  ? 'bg-surface text-text-main font-semibold shadow-subtle'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              {sev === 'ALL' ? 'All Alerts' : sev}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map(alert => (
            <div
              key={alert.id}
              className={`p-5 rounded-card border shadow-subtle transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${getAlertBorder(
                alert.severity,
                alert.isResolved
              )}`}
            >
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5">
                  <StatusBadge status={alert.severity} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-text-main">{alert.title}</h3>
                    <span className="text-xs text-text-caption">• {alert.timestamp}</span>
                    {alert.isResolved && (
                      <span className="text-[11px] text-emerald-800 font-medium bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200">
                        Resolved
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed max-w-3xl">
                    {alert.description}
                  </p>
                  <div className="text-[11px] text-text-caption mt-1.5">
                    Target Resource: <span className="font-semibold text-text-main">{alert.relatedEntity.name}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {!alert.isResolved && (
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-text-muted hover:text-text-main bg-surface hover:bg-surface-subtle border border-border-subtle transition-colors shadow-subtle"
                    title="Mark as resolved"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Acknowledge</span>
                  </button>
                )}

                <button
                  onClick={() => navigate(alert.actionRoute)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold text-white bg-brand-teal hover:bg-teal-700 transition-all shadow-subtle"
                >
                  <span>{alert.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-surface p-12 rounded-card border border-border-subtle text-center space-y-3 shadow-subtle">
            <CheckCircle2 className="w-9 h-9 text-emerald-600 mx-auto" />
            <div className="text-sm font-semibold text-text-main">No Alerts in this Category</div>
            <p className="text-xs text-text-muted">All operational parameters are currently within normal thresholds.</p>
          </div>
        )}
      </div>
    </div>
  );
};
