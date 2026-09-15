import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Edit2,
  X,
  Package,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { useOperations } from '../../context/OperationsContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';

export const ShippingCargoPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { vessels, updateCargoInfo } = useOperations();

  const [selectedVesselId, setSelectedVesselId] = useState<string | null>(null);
  const [cargoForm, setCargoForm] = useState({
    cargoQuantity: '',
    containersLoaded: 0,
    containersTotal: 0,
    dangerousGoods: false,
    specialNotes: '',
  });

  const agentVessels = vessels.filter(
    v => !v.ownerId || v.ownerId === user?.id || v.ownerId === 'demo-agent'
  );

  const handleOpenEdit = (vesselId: string) => {
    const v = vessels.find(item => item.id === vesselId);
    if (v) {
      setSelectedVesselId(v.id);
      setCargoForm({
        cargoQuantity: v.cargoQuantity || `${v.cargoVolume} TEU`,
        containersLoaded: v.containersLoaded || Math.floor(v.cargoVolume * 0.7),
        containersTotal: v.containersTotal || v.cargoVolume,
        dangerousGoods: Boolean(v.dangerousGoods),
        specialNotes: v.specialNotes || '',
      });
    }
  };

  const handleSaveCargo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVesselId) return;

    updateCargoInfo(selectedVesselId, {
      cargoQuantity: cargoForm.cargoQuantity,
      containersLoaded: Number(cargoForm.containersLoaded),
      containersTotal: Number(cargoForm.containersTotal),
      dangerousGoods: cargoForm.dangerousGoods,
      specialNotes: cargoForm.specialNotes,
    });
    setSelectedVesselId(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 min-w-0">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-main">
            Cargo Management & Operations
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Monitor container handling rates, stowage progress, and hazardous cargo segregation.
          </p>
        </div>
      </div>

      {/* 2. Fleet Cargo Cards */}
      <div className="space-y-4">
        {agentVessels.map(v => {
          const total = v.containersTotal || v.cargoVolume || 1000;
          const loaded = v.containersLoaded !== undefined ? v.containersLoaded : Math.floor(total * 0.75);
          const percent = Math.min(100, Math.round((loaded / total) * 100));
          const remaining = Math.max(0, total - loaded);

          return (
            <div
              key={v.id}
              className="p-5 rounded-lg bg-surface border border-border-subtle shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-sky-300 transition-all space-y-4"
            >
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-bold text-base text-text-main">{v.name}</span>
                  <span className="text-xs text-text-muted font-mono">IMO {v.imo}</span>
                  <StatusBadge status={v.status} />
                  {v.dangerousGoods && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3 text-rose-600" />
                      IMDG Dangerous Goods
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(v.id)}
                    className="px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-subtle border border-border-subtle text-xs font-medium text-text-main transition-colors flex items-center gap-1.5 cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                  >
                    <Edit2 className="w-3 h-3 text-text-caption" />
                    <span>Update Cargo</span>
                  </button>
                  <button
                    onClick={() => navigate(`/shipping/vessels/${v.id}`)}
                    className="p-1.5 rounded-xl bg-surface hover:bg-surface-subtle border border-border-subtle text-text-caption hover:text-text-main transition-colors cursor-pointer"
                    title="View Vessel"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar & Numerical Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div className="md:col-span-2 space-y-2">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-text-muted">Loading & Discharge Progress</span>
                    <span className="text-sky-900 font-bold">{percent}% Complete</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-3 bg-surface-subtle rounded-full overflow-hidden border border-border-subtle p-0.5">
                    <div
                      className="h-full bg-sky-600 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-text-muted pt-0.5">
                    <span>Handled: <strong>{loaded.toLocaleString()}</strong> TEU</span>
                    <span>Remaining: <strong>{remaining.toLocaleString()}</strong> TEU</span>
                    <span>Manifest Total: <strong>{total.toLocaleString()}</strong> TEU</span>
                  </div>
                </div>

                <div className="p-3 rounded bg-surface-subtle border border-border-subtle space-y-1">
                  <span className="text-[10px] text-text-muted uppercase font-semibold">Cargo Description</span>
                  <div className="font-semibold text-text-main">{v.cargoType || 'General Containerized Freight'}</div>
                  <div className="text-[10px] text-text-caption">{v.cargoQuantity || `${total} TEU slots allocated`}</div>
                </div>

                <div className="p-3 rounded bg-surface-subtle border border-border-subtle space-y-1">
                  <span className="text-[10px] text-text-muted uppercase font-semibold">Berth Handling</span>
                  <div className="font-semibold font-mono text-text-main">
                    Berth {v.assignedBerth || v.requestedBerth || 'B02'}
                  </div>
                  <div className="text-[10px] text-text-caption">Target: ~28 moves / hour per crane</div>
                </div>
              </div>

              {/* Special Cargo Notes */}
              {v.specialNotes && (
                <div className="p-2.5 rounded bg-surface-subtle border border-border-subtle text-[11px] text-text-muted flex items-start gap-2">
                  <Package className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-text-main">Stowage & Safety Instructions: </span>
                    <span>{v.specialNotes}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ================================================= */}
      {/* MODAL: UPDATE CARGO PROGRESS */}
      {/* ================================================= */}
      {selectedVesselId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-surface rounded-xl border border-border-subtle shadow-modal max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-semibold text-text-main">Update Cargo Manifest & Progress</h3>
              </div>
              <button
                onClick={() => setSelectedVesselId(null)}
                className="p-1 rounded-xl text-text-caption hover:text-text-main cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCargo} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-text-main">Containers Handled (TEU)</label>
                  <input
                    type="number"
                    value={cargoForm.containersLoaded}
                    onChange={e => setCargoForm({ ...cargoForm, containersLoaded: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-border-subtle text-text-main text-xs focus:outline-hidden focus:border-sky-500 mt-1"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-text-main">Total Manifest (TEU)</label>
                  <input
                    type="number"
                    value={cargoForm.containersTotal}
                    onChange={e => setCargoForm({ ...cargoForm, containersTotal: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-border-subtle text-text-main text-xs focus:outline-hidden focus:border-sky-500 mt-1"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-text-main">Cargo Description Summary</label>
                <input
                  type="text"
                  value={cargoForm.cargoQuantity}
                  onChange={e => setCargoForm({ ...cargoForm, cargoQuantity: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-border-subtle text-text-main text-xs focus:outline-hidden focus:border-sky-500 mt-1"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 p-2.5 rounded bg-surface-subtle border border-border-subtle cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cargoForm.dangerousGoods}
                    onChange={e => setCargoForm({ ...cargoForm, dangerousGoods: e.target.checked })}
                    className="rounded text-sky-600 focus:ring-sky-500 h-4 w-4"
                  />
                  <span className="font-medium text-text-main">Dangerous Goods (IMDG Hazmat) on Manifest</span>
                </label>
              </div>

              <div>
                <label className="font-semibold text-text-main">Special Handling Notes</label>
                <textarea
                  rows={2}
                  value={cargoForm.specialNotes}
                  onChange={e => setCargoForm({ ...cargoForm, specialNotes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-border-subtle text-text-main text-xs focus:outline-hidden focus:border-sky-500 mt-1 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setSelectedVesselId(null)}
                  className="px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-subtle border border-border-subtle text-text-main cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                >
                  Save Cargo Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

