import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Anchor,
  PlusCircle,
  Clock,
  Ship,
  CheckCircle2,
  AlertTriangle,
  X,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useOperations } from '../../context/OperationsContext';
import { useAuth } from '../../context/AuthContext';
import { BerthRequestStatus } from '../../types/operations';

export const ShippingBerthRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    berthRequests,
    submitBerthRequest,
    vessels,
    berths,
    isOptimizationApplied,
  } = useOperations();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter requests belonging to this agent
  const agentRequests = berthRequests.filter(
    r => !r.ownerId || r.ownerId === user?.id || r.ownerId === 'demo-agent'
  );

  const filteredRequests = agentRequests.filter(
    r => statusFilter === 'ALL' || r.status === statusFilter
  );

  // New Request Form State
  const [newRequest, setNewRequest] = useState({
    vesselId: vessels[0]?.id || 'VES-01',
    requestedBerth: 'B04',
    requestedArrivalTime: 'Tomorrow, 14:00 UTC',
    estimatedDurationHours: '24',
    requestedCranes: '4',
    cargoType: 'Containerized Cargo (ULCV)',
    notes: 'Standard discharge and loading operations.',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedVessel = vessels.find(v => v.id === newRequest.vesselId) || vessels[0];

    submitBerthRequest({
      vesselId: selectedVessel.id,
      vesselName: selectedVessel.name,
      imo: selectedVessel.imo,
      requestedBerth: newRequest.requestedBerth,
      requestedArrivalTime: newRequest.requestedArrivalTime,
      estimatedDurationHours: Number(newRequest.estimatedDurationHours) || 24,
      requestedCranes: Number(newRequest.requestedCranes) || 3,
      cargoType: newRequest.cargoType,
      notes: newRequest.notes,
      ownerId: user?.id || 'demo-agent',
    });

    setIsModalOpen(false);
  };

  const getStatusBadge = (status: BerthRequestStatus) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Approved
          </span>
        );
      case 'Changed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200 inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-sky-600" />
            Changed by Port
          </span>
        );
      case 'Under Review':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" />
            Under Review
          </span>
        );
      case 'Pending':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200 inline-flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-500" />
            Pending Review
          </span>
        );
      case 'Rejected':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 inline-flex items-center gap-1">
            <X className="w-3 h-3 text-rose-600" />
            Rejected
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 min-w-0">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-text-main">
              Berth Requests
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200">
              Quayside Dispatch
            </span>
          </div>
          <p className="text-xs text-text-muted mt-1">
            File quayside berth preferences, specify arrival windows, and track port authority allocations.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 transition-all shadow-subtle cursor-pointer shrink-0"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>+ Request a Berth</span>
        </button>
      </div>

      {/* 2. Operational Notice */}
      <div className="p-4 rounded-lg bg-sky-50/60 border border-sky-200 flex items-start gap-3 text-xs text-sky-950">
        <Anchor className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Port Allocation Protocol:</span> Ship agents submit berth requests with preferred arrival windows and equipment requirements. The Port Operations authority and optimization engine make final scheduling decisions to maximize quayside throughput.
        </div>
      </div>

      {/* 3. Filter Bar */}
      <div className="bg-surface p-3.5 rounded-lg border border-border-subtle shadow-subtle flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-text-muted mr-1 font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-text-caption" /> Filter:
          </span>
          {['ALL', 'Pending', 'Under Review', 'Approved', 'Changed'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === status
                  ? 'bg-sky-600 text-white font-semibold'
                  : 'bg-surface-subtle text-text-muted hover:text-text-main hover:bg-slate-200'
              }`}
            >
              {status === 'ALL' ? 'All Requests' : status}
            </button>
          ))}
        </div>

        <div className="text-xs text-text-muted">
          Showing <strong className="text-text-main">{filteredRequests.length}</strong> of {agentRequests.length} requests
        </div>
      </div>

      {/* 4. Requests List */}
      <div className="space-y-3">
        {filteredRequests.map(req => {
          const isOceanStar = req.vesselId === 'VES-01';
          const assignedBerth = isOceanStar && isOptimizationApplied ? 'B02' : req.assignedBerth;
          const currentStatus = isOceanStar && isOptimizationApplied ? 'Changed' : req.status;

          return (
            <div
              key={req.id}
              className="p-5 rounded-lg bg-surface border border-border-subtle shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-sky-300 transition-colors"
            >
              {/* Left Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-bold text-sm text-text-main">{req.vesselName}</span>
                  <span className="text-xs text-text-muted font-mono">IMO {req.imo}</span>
                  <span className="font-mono text-[11px] text-text-caption">ID: {req.id}</span>
                  {getStatusBadge(currentStatus)}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-[10px] text-text-muted uppercase">Requested Berth</span>
                    <div className="font-semibold font-mono text-text-main mt-0.5">
                      Berth {req.requestedBerth}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-text-muted uppercase">Requested Arrival</span>
                    <div className="font-medium text-text-main mt-0.5">{req.requestedArrivalTime}</div>
                  </div>

                  <div>
                    <span className="text-[10px] text-text-muted uppercase">Cranes / Duration</span>
                    <div className="font-medium text-text-main mt-0.5">
                      {req.requestedCranes} STS Cranes • {req.estimatedDurationHours}h
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-text-muted uppercase">Assigned Allocation</span>
                    <div className="font-semibold font-mono text-emerald-700 mt-0.5">
                      {assignedBerth ? `Berth ${assignedBerth}` : 'Pending Port Assignment'}
                    </div>
                  </div>
                </div>

                {req.notes && (
                  <p className="text-[11px] text-text-muted italic pt-1">
                    "{req.notes}"
                  </p>
                )}
              </div>

              {/* Right Action */}
              <div className="flex items-center gap-2 shrink-0 md:self-center">
                <button
                  onClick={() => navigate(`/shipping/vessels/${req.vesselId}`)}
                  className="px-3.5 py-1.5 rounded-md bg-surface-subtle hover:bg-sky-50 text-sky-800 hover:text-sky-900 border border-border-subtle font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>View Vessel</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================================================= */}
      {/* MODAL: SUBMIT NEW BERTH REQUEST */}
      {/* ================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-surface rounded-xl border border-border-subtle shadow-modal max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <Anchor className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-semibold text-text-main">Submit Berth Request</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md text-text-caption hover:text-text-main cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-text-main">Select Vessel</label>
                <select
                  value={newRequest.vesselId}
                  onChange={e => setNewRequest({ ...newRequest, vesselId: e.target.value })}
                  className="w-full px-3 py-2 rounded-md bg-surface-subtle border border-border-subtle text-text-main text-xs focus:outline-hidden focus:border-sky-500 mt-1"
                >
                  {vessels.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} (IMO {v.imo}) - {v.status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-text-main">Preferred Berth</label>
                  <select
                    value={newRequest.requestedBerth}
                    onChange={e => setNewRequest({ ...newRequest, requestedBerth: e.target.value })}
                    className="w-full px-3 py-2 rounded-md bg-surface-subtle border border-border-subtle text-text-main text-xs focus:outline-hidden focus:border-sky-500 mt-1"
                  >
                    {berths.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.id} ({b.name}) - Depth {b.depthMeters}m
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-text-main">Requested Cranes</label>
                  <select
                    value={newRequest.requestedCranes}
                    onChange={e => setNewRequest({ ...newRequest, requestedCranes: e.target.value })}
                    className="w-full px-3 py-2 rounded-md bg-surface-subtle border border-border-subtle text-text-main text-xs focus:outline-hidden focus:border-sky-500 mt-1"
                  >
                    <option value="1">1 STS Crane</option>
                    <option value="2">2 STS Cranes</option>
                    <option value="3">3 STS Cranes</option>
                    <option value="4">4 STS Cranes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-text-main">Requested Arrival Time</label>
                  <input
                    type="text"
                    placeholder="e.g. Tomorrow, 14:00 UTC"
                    value={newRequest.requestedArrivalTime}
                    onChange={e => setNewRequest({ ...newRequest, requestedArrivalTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-md bg-surface-subtle border border-border-subtle text-text-main text-xs focus:outline-hidden focus:border-sky-500 mt-1"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-text-main">Est. Duration (Hours)</label>
                  <input
                    type="number"
                    value={newRequest.estimatedDurationHours}
                    onChange={e => setNewRequest({ ...newRequest, estimatedDurationHours: e.target.value })}
                    className="w-full px-3 py-2 rounded-md bg-surface-subtle border border-border-subtle text-text-main text-xs focus:outline-hidden focus:border-sky-500 mt-1"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-text-main">Cargo Type & Handling Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Priority ULCV discharge, refrigerated containers"
                  value={newRequest.cargoType}
                  onChange={e => setNewRequest({ ...newRequest, cargoType: e.target.value })}
                  className="w-full px-3 py-2 rounded-md bg-surface-subtle border border-border-subtle text-text-main text-xs focus:outline-hidden focus:border-sky-500 mt-1"
                />
              </div>

              <div>
                <label className="font-semibold text-text-main">Special Mooring / Pilotage Instructions</label>
                <textarea
                  rows={2}
                  placeholder="Notes for Port Authority harbor master..."
                  value={newRequest.notes}
                  onChange={e => setNewRequest({ ...newRequest, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-md bg-surface-subtle border border-border-subtle text-text-main text-xs focus:outline-hidden focus:border-sky-500 mt-1 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-md bg-surface hover:bg-surface-subtle border border-border-subtle text-text-main cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-sky-600 hover:bg-sky-700 text-white font-semibold cursor-pointer shadow-subtle"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
