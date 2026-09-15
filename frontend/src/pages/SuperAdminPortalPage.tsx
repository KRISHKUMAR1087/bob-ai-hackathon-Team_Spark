import React, { useState } from 'react';
import { ShieldAlert, Globe, Server, Users, Activity, BarChart3, Settings, LogOut, ExternalLink, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Demo Data for the Super Admin
const DEMO_PORTS = [
  { id: 'port-1', name: 'Port of Rotterdam', region: 'Europe', status: 'Healthy', activeAgents: 142, load: '78%' },
  { id: 'port-2', name: 'Port of Singapore', region: 'Asia', status: 'Warning', activeAgents: 210, load: '92%' },
  { id: 'port-3', name: 'Port of Los Angeles', region: 'Americas', status: 'Healthy', activeAgents: 185, load: '65%' },
  { id: 'port-4', name: 'Jebel Ali Port', region: 'Middle East', status: 'Critical', activeAgents: 95, load: '98%' },
];

export const SuperAdminPortalPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="min-h-screen bg-canvas font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-brand-teal text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight">PortsPilot</h1>
              <p className="text-[10px] text-teal-100 font-medium uppercase tracking-widest leading-none">Global Super Admin</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button onClick={handleRefresh} className={`p-2 rounded-full hover:bg-white/10 transition-colors ${isRefreshing ? 'animate-spin' : ''}`}>
              <RefreshCw className="w-4 h-4 text-white" />
            </button>
            <div className="h-6 w-px bg-white/20 mx-1"></div>
            <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-medium hover:text-teal-100 transition-colors">
              <LogOut className="w-4 h-4" /> Exit Portal
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-text-main">Global Command Center</h2>
            <p className="text-sm text-text-muted mt-1">System-wide performance monitoring and tenant management.</p>
          </div>
          <button className="bg-brand-teal hover:bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-subtle transition-colors flex items-center gap-2 self-start sm:self-auto">
            <Settings className="w-4 h-4" /> Global Configuration
          </button>
        </div>

        {/* Global KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active Ports', value: '34', icon: Globe, color: 'text-brand-blue', bg: 'bg-blue-50' },
            { label: 'Total Operations Admins', value: '1,280', icon: Users, color: 'text-brand-teal', bg: 'bg-teal-50' },
            { label: 'System Uptime', value: '99.98%', icon: Server, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Global Alerts', value: '12', icon: Activity, color: 'text-rose-600', bg: 'bg-rose-50' },
          ].map((metric, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-border-subtle p-5 shadow-subtle flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-text-caption uppercase tracking-wider mb-1">{metric.label}</p>
                <p className="text-2xl font-bold text-text-main">{metric.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${metric.bg}`}>
                <metric.icon className={`w-5 h-5 ${metric.color}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Ports Table */}
        <div className="bg-white rounded-2xl border border-border-subtle shadow-subtle overflow-hidden">
          <div className="px-6 py-4 border-b border-border-subtle bg-surface-subtle flex items-center justify-between">
            <h3 className="font-bold text-text-main flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand-teal" /> Monitored Terminals
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-surface-subtle text-text-muted font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Terminal Name</th>
                  <th className="px-6 py-3">Region</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Active Agents</th>
                  <th className="px-6 py-3 text-right">Load %</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {DEMO_PORTS.map(port => (
                  <tr key={port.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-text-main">{port.name}</td>
                    <td className="px-6 py-4 text-text-muted">{port.region}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        port.status === 'Healthy' ? 'bg-emerald-50 text-emerald-700' :
                        port.status === 'Warning' ? 'bg-amber-50 text-amber-700' :
                        'bg-rose-50 text-rose-700'
                      }`}>
                        {port.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-text-muted">{port.activeAgents}</td>
                    <td className="px-6 py-4 text-right font-mono text-text-muted">{port.load}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="inline-flex items-center justify-center p-1.5 rounded-lg text-brand-teal hover:bg-teal-50 transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};
