import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  Mail,
  Building,
  Radio
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOperations } from '../../context/OperationsContext';

export const ShippingProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useOperations();

  const [ediAlerts, setEdiAlerts] = useState(true);
  const [demurrageSms, setDemurrageSms] = useState(true);
  const [pilotageUpdates, setPilotageUpdates] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const handleSavePreferences = () => {
    showToast('success', 'Agency Preferences Saved', 'Notification thresholds and VHF telemetry channels updated.');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-main">
            Shipping Agent Profile
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Manage your agency credentials, port notification channels, and active vessel dispatch privileges.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors shadow-[0_8px_30px_rgb(0,0,0,0.04)] self-start sm:self-auto cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-surface rounded-3xl border border-border-subtle shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 space-y-5">
        <div className="flex items-center gap-4 border-b border-border-subtle pb-5">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover border border-border-subtle shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-sky-100 border border-sky-200 text-sky-800 flex items-center justify-center font-bold text-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              SA
            </div>
          )}

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-text-main">
                {user?.name || 'Shipping Agent'}
              </h2>
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200">
                Ship Agent
              </span>
            </div>
            <p className="text-xs text-text-muted flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-text-caption" />
              <span>{user?.email || 'agent@portpulse.demo'}</span>
            </p>
          </div>
        </div>

        {/* Agency Information Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-surface-subtle border border-border-subtle space-y-1">
            <span className="text-text-muted flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-text-caption" />
              Registered Shipping Line Agency:
            </span>
            <div className="font-semibold text-text-main text-sm">
              Mediterranean & North Sea Agency Ltd.
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-surface-subtle border border-border-subtle space-y-1">
            <span className="text-text-muted flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-text-caption" />
              Port Communications Frequency:
            </span>
            <div className="font-semibold text-text-main text-sm">
              VHF Channel 14 / EDI Gateway Active
            </div>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-surface rounded-3xl border border-border-subtle shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 space-y-4">
        <h3 className="text-sm font-semibold text-text-main border-b border-border-subtle pb-3">
          Agency Dispatch Alerts & Notification Preferences
        </h3>

        <div className="space-y-3.5 text-xs">
          <div className="flex items-center justify-between py-2 border-b border-border-subtle">
            <div>
              <div className="font-semibold text-text-main">Direct Berth Reallocation Notices</div>
              <div className="text-text-muted text-[11px]">
                Receive immediate notice when Port Authority adjusts assigned berths (e.g. B04 to B02).
              </div>
            </div>
            <input
              type="checkbox"
              checked={ediAlerts}
              onChange={e => setEdiAlerts(e.target.checked)}
              className="accent-brand-teal w-4 h-4 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between py-2 border-b border-border-subtle">
            <div>
              <div className="font-semibold text-text-main">Demurrage Risk Threshold Advisories</div>
              <div className="text-text-muted text-[11px]">
                Notify operational superintendents when predicted wait time exceeds 8 hours.
              </div>
            </div>
            <input
              type="checkbox"
              checked={demurrageSms}
              onChange={e => setDemurrageSms(e.target.checked)}
              className="accent-brand-teal w-4 h-4 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <div className="font-semibold text-text-main">Pilotage & Tug Fast Telemetry</div>
              <div className="text-text-muted text-[11px]">
                Transmit real-time boarding confirmations from Pilot Station Alpha.
              </div>
            </div>
            <input
              type="checkbox"
              checked={pilotageUpdates}
              onChange={e => setPilotageUpdates(e.target.checked)}
              className="accent-brand-teal w-4 h-4 cursor-pointer"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSavePreferences}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-teal hover:bg-teal-700 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            Save Notification Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

