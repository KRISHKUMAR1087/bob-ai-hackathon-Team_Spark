import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowUpDown,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { useOperations } from '../context/OperationsContext';
import { StatusBadge } from '../components/common/StatusBadge';

export const VesselsPage: React.FC = () => {
  const navigate = useNavigate();
  const { vessels, searchQuery, setSearchQuery, isOptimizationApplied } = useOperations();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'name' | 'eta' | 'wait' | 'teu'>('wait');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const filteredVessels = vessels
    .filter(v => {
      const matchSearch =
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.imo.includes(searchQuery) ||
        v.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.assignedBerth.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || v.status === statusFilter;
      const matchPriority = priorityFilter === 'ALL' || v.priority === priorityFilter;
      return matchSearch && matchStatus && matchPriority;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') comparison = a.name.localeCompare(b.name);
      if (sortField === 'eta') comparison = a.eta.localeCompare(b.eta);
      if (sortField === 'wait') comparison = a.predictedWaitHours - b.predictedWaitHours;
      if (sortField === 'teu') comparison = a.teuCapacity - b.teuCapacity;
      return sortAsc ? comparison : -comparison;
    });

  const toggleSort = (field: 'name' | 'eta' | 'wait' | 'teu') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main tracking-tight">
            Vessel Traffic Management
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Tracking {vessels.length} commercial vessels across anchorage and active quayside berths.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span>In Queue:</span>
          <span className="px-2.5 py-1 rounded-md bg-surface border border-border-subtle font-semibold text-text-main shadow-subtle">
            {vessels.filter(v => v.status === 'Arriving' || v.status === 'At Anchor').length} Vessels
          </span>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-surface p-4 rounded-card border border-border-subtle shadow-subtle flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="w-4 h-4 text-text-caption absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by vessel, IMO, or berth..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-surface-subtle border border-border-subtle rounded-md pl-9 pr-3 py-1.5 text-xs text-text-main placeholder-text-caption focus:outline-hidden focus:border-brand-teal"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-surface-subtle border border-border-subtle rounded-md px-3 py-1.5 text-xs text-text-main focus:outline-hidden focus:border-brand-teal"
          >
            <option value="ALL">All Statuses</option>
            <option value="Arriving">Arriving</option>
            <option value="At Anchor">At Anchor</option>
            <option value="Berthing">Berthing</option>
            <option value="Loading">Loading</option>
            <option value="Delayed">Delayed</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="bg-surface-subtle border border-border-subtle rounded-md px-3 py-1.5 text-xs text-text-main focus:outline-hidden focus:border-brand-teal"
          >
            <option value="ALL">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="Priority">Priority</option>
            <option value="Standard">Standard</option>
          </select>
        </div>

        <div className="text-xs text-text-muted">
          Showing <strong className="text-text-main">{filteredVessels.length}</strong> of {vessels.length} vessels
        </div>
      </div>

      {/* Operational Vessels Table */}
      <div className="bg-surface rounded-card border border-border-subtle shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-surface-subtle border-b border-border-subtle text-text-muted font-medium text-[11px] uppercase tracking-wider">
              <tr>
                <th
                  onClick={() => toggleSort('name')}
                  className="py-3.5 px-4 cursor-pointer hover:text-text-main transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Vessel</span>
                    <ArrowUpDown className="w-3 h-3 text-text-caption" />
                  </div>
                </th>
                <th className="py-3.5 px-3">IMO</th>
                <th
                  onClick={() => toggleSort('eta')}
                  className="py-3.5 px-3 cursor-pointer hover:text-text-main transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>ETA / ETD</span>
                    <ArrowUpDown className="w-3 h-3 text-text-caption" />
                  </div>
                </th>
                <th className="py-3.5 px-3">Current Berth</th>
                <th className="py-3.5 px-3">Assigned Berth</th>
                <th className="py-3.5 px-3">Priority</th>
                <th className="py-3.5 px-3">Status</th>
                <th
                  onClick={() => toggleSort('wait')}
                  className="py-3.5 px-3 cursor-pointer hover:text-text-main transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Predicted Wait</span>
                    <ArrowUpDown className="w-3 h-3 text-text-caption" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border-subtle">
              {filteredVessels.map(v => (
                <tr
                  key={v.id}
                  className="hover:bg-surface-subtle/50 transition-colors"
                >
                  {/* Vessel Name & Flag */}
                  <td className="py-3.5 px-4">
                    <div
                      onClick={() => navigate(`/operations/vessels/${v.id}`)}
                      className="cursor-pointer font-semibold text-text-main hover:text-brand-teal transition-colors"
                    >
                      {v.name}
                    </div>
                    <div className="text-[11px] text-text-caption">
                      {v.flag} • {v.lengthMeters}m • {v.teuCapacity.toLocaleString()} TEU
                    </div>
                  </td>

                  {/* IMO */}
                  <td className="py-3.5 px-3 text-text-muted font-mono text-[11px]">{v.imo}</td>

                  {/* ETA/ETD */}
                  <td className="py-3.5 px-3 text-xs">
                    <div className="text-text-main font-medium">{v.eta}</div>
                    <div className="text-[11px] text-text-caption">ETD: {v.etd}</div>
                  </td>

                  {/* Current Berth */}
                  <td className="py-3.5 px-3 text-xs">
                    {v.currentBerth ? (
                      <span className="font-semibold text-text-main">{v.currentBerth}</span>
                    ) : (
                      <span className="text-text-caption">Anchorage</span>
                    )}
                  </td>

                  {/* Assigned Berth */}
                  <td className="py-3.5 px-3">
                    <span
                      className={`font-semibold px-2 py-0.5 rounded text-xs border ${
                        v.assignedBerth === 'B04' && !isOptimizationApplied
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : v.assignedBerth === 'B02' && isOptimizationApplied && v.id === 'VES-01'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-surface-subtle text-text-main border-border-subtle'
                      }`}
                    >
                      {v.assignedBerth}
                    </span>
                  </td>

                  {/* Priority */}
                  <td className="py-3.5 px-3">
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                        v.priority === 'Critical'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : v.priority === 'Priority'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {v.priority}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-3">
                    <StatusBadge status={v.status} />
                  </td>

                  {/* Predicted Wait */}
                  <td className="py-3.5 px-3">
                    <div className="font-semibold text-text-main text-xs">
                      {v.predictedWaitHours}h
                    </div>
                    <div
                      className={`text-[11px] ${
                        v.demurrageRisk === 'High'
                          ? 'text-rose-600 font-medium'
                          : 'text-text-caption'
                      }`}
                    >
                      {v.demurrageRisk} Demurrage
                    </div>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {v.id === 'VES-01' && (
                        <button
                          onClick={() => navigate('/decision/optimizer')}
                          className="px-2.5 py-1 rounded-md text-xs font-semibold text-white bg-brand-teal hover:bg-teal-700 transition-all shadow-subtle flex items-center gap-1"
                        >
                          <Zap className="w-3 h-3" />
                          <span>Optimize</span>
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/operations/vessels/${v.id}`)}
                        className="p-1.5 rounded-md text-text-caption hover:text-text-main hover:bg-surface-subtle transition-colors"
                        title="View Vessel Profile"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
