import React, { useState } from 'react';
import {
  FileText,
  PlusCircle,
  Download,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Upload,
  Ship,
  Search,
} from 'lucide-react';
import { useOperations } from '../../context/OperationsContext';
import { useAuth } from '../../context/AuthContext';
import { DocumentType, ShippingDocument } from '../../types/operations';

export const ShippingDocumentsPage: React.FC = () => {
  const { user } = useAuth();
  const {
    shippingDocuments,
    uploadDocument,
    deleteDocument,
    vessels,
    showToast,
  } = useOperations();

  const [search, setSearch] = useState('');
  const [selectedVesselFilter, setSelectedVesselFilter] = useState('ALL');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Document Form
  const [newDoc, setNewDoc] = useState({
    name: '',
    vesselId: vessels[0]?.id || 'VES-01',
    type: 'Bill of Lading' as DocumentType,
    fileName: 'document.pdf',
    fileSize: '2.4 MB',
  });

  const agentDocs = shippingDocuments.filter(
    d => !d.ownerId || d.ownerId === user?.id || d.ownerId === 'demo-agent'
  );

  const filteredDocs = agentDocs.filter(d => {
    const term = search.toLowerCase();
    const matchSearch =
      !term ||
      d.name.toLowerCase().includes(term) ||
      d.vesselName.toLowerCase().includes(term) ||
      d.type.toLowerCase().includes(term);

    const matchVessel = selectedVesselFilter === 'ALL' || d.vesselId === selectedVesselFilter;
    const matchType = selectedTypeFilter === 'ALL' || d.type === selectedTypeFilter;

    return matchSearch && matchVessel && matchType;
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.name.trim()) return;

    const targetVessel = vessels.find(v => v.id === newDoc.vesselId) || vessels[0];

    uploadDocument({
      name: newDoc.name.trim(),
      vesselId: targetVessel.id,
      vesselName: targetVessel.name,
      type: newDoc.type,
      fileSize: newDoc.fileSize,
      ownerId: user?.id || 'demo-agent',
    });

    setIsModalOpen(false);
    setNewDoc({
      name: '',
      vesselId: vessels[0]?.id || 'VES-01',
      type: 'Bill of Lading',
      fileName: 'document.pdf',
      fileSize: '2.4 MB',
    });
  };

  const handleDownload = (docName: string) => {
    showToast('info', 'Document Downloaded', `Generated secure copy of ${docName}.`);
  };

  const getStatusBadge = (status: ShippingDocument['status']) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Approved
          </span>
        );
      case 'Under Review':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" />
            Under Review
          </span>
        );
      case 'Required':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 inline-flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            Action Required
          </span>
        );
      case 'Draft':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
            Draft
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
              Vessel Documents & Clearances
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200">
              Customs & Port Authority
            </span>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Manage Bills of Lading, cargo declarations, dangerous goods manifests, and arrival notices.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)] cursor-pointer shrink-0"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* 2. Filter Toolbar */}
      <div className="bg-surface p-4 rounded-3xl border border-border-subtle shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-wrap items-center justify-between gap-3 min-w-0">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm w-full">
            <Search className="w-4 h-4 text-text-caption absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search document name, vessel, type..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-surface-subtle border border-border-subtle rounded-xl pl-9 pr-3 py-1.5 text-xs text-text-main placeholder-text-caption focus:outline-hidden focus:border-sky-500"
            />
          </div>

          {/* Filter by Vessel */}
          <select
            value={selectedVesselFilter}
            onChange={e => setSelectedVesselFilter(e.target.value)}
            className="bg-surface-subtle border border-border-subtle rounded-xl px-3 py-1.5 text-xs text-text-main focus:outline-hidden focus:border-sky-500"
          >
            <option value="ALL">All Vessels</option>
            {vessels.map(v => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>

          {/* Filter by Type */}
          <select
            value={selectedTypeFilter}
            onChange={e => setSelectedTypeFilter(e.target.value)}
            className="bg-surface-subtle border border-border-subtle rounded-xl px-3 py-1.5 text-xs text-text-main focus:outline-hidden focus:border-sky-500"
          >
            <option value="ALL">All Document Types</option>
            <option value="Bill of Lading">Bill of Lading</option>
            <option value="Cargo Manifest">Cargo Manifest</option>
            <option value="Vessel Declaration">Vessel Declaration</option>
            <option value="Arrival Notice">Arrival Notice</option>
            <option value="Dangerous Goods Declaration">Dangerous Goods Declaration</option>
            <option value="Customs Clearance">Customs Clearance</option>
          </select>
        </div>

        <div className="text-xs text-text-muted">
          Showing <strong className="text-text-main">{filteredDocs.length}</strong> documents
        </div>
      </div>

      {/* 3. Documents Table */}
      <div className="bg-surface rounded-3xl border border-border-subtle shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden w-full min-w-0">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs font-sans min-w-[750px]">
            <thead className="bg-surface-subtle border-b border-border-subtle text-text-muted font-medium text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Document Name</th>
                <th className="py-3 px-3">Vessel</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Uploaded Date</th>
                <th className="py-3 px-3">File Size</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-text-muted text-xs">
                    No documents found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredDocs.map(doc => (
                  <tr key={doc.id} className="hover:bg-surface-subtle/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-text-main">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-sky-600 shrink-0" />
                        <span>{doc.name}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 font-medium text-text-main">
                      <div className="flex items-center gap-1.5">
                        <Ship className="w-3 h-3 text-text-caption shrink-0" />
                        <span>{doc.vesselName}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-text-muted">
                      {doc.type}
                    </td>

                    <td className="py-3.5 px-3">
                      {getStatusBadge(doc.status)}
                    </td>

                    <td className="py-3.5 px-3 text-text-muted font-mono text-[11px]">
                      {doc.uploadedDate}
                    </td>

                    <td className="py-3.5 px-3 text-text-caption font-mono text-[11px]">
                      {doc.fileSize}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleDownload(doc.name)}
                          className="p-1.5 rounded-xl hover:bg-surface-subtle text-text-caption hover:text-text-main transition-colors cursor-pointer"
                          title="Download Document"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteDocument(doc.id)}
                          className="p-1.5 rounded-xl hover:bg-rose-50 text-text-caption hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete Document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================================================= */}
      {/* MODAL: UPLOAD DOCUMENT */}
      {/* ================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-surface rounded-xl border border-border-subtle shadow-modal max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-semibold text-text-main">Upload Vessel Document</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl text-text-caption hover:text-text-main cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-text-main">Document Title</label>
                <input
                  type="text"
                  placeholder="e.g. Master's Dangerous Goods Manifest"
                  value={newDoc.name}
                  onChange={e => setNewDoc({ ...newDoc, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-border-subtle text-text-main text-xs focus:outline-hidden focus:border-sky-500 mt-1"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-text-main">Target Vessel</label>
                <select
                  value={newDoc.vesselId}
                  onChange={e => setNewDoc({ ...newDoc, vesselId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-border-subtle text-text-main text-xs focus:outline-hidden focus:border-sky-500 mt-1"
                >
                  {vessels.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} (IMO {v.imo})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-text-main">Document Classification</label>
                <select
                  value={newDoc.type}
                  onChange={e => setNewDoc({ ...newDoc, type: e.target.value as DocumentType })}
                  className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-border-subtle text-text-main text-xs focus:outline-hidden focus:border-sky-500 mt-1"
                >
                  <option value="Bill of Lading">Bill of Lading (B/L)</option>
                  <option value="Cargo Manifest">Cargo Manifest</option>
                  <option value="Vessel Declaration">General Vessel Declaration (FAL 1)</option>
                  <option value="Arrival Notice">Advance Arrival Notice (72h)</option>
                  <option value="Dangerous Goods Declaration">Dangerous Goods Declaration (IMDG)</option>
                  <option value="Customs Clearance">Customs Clearance Documentation</option>
                  <option value="Other">Other Operational Record</option>
                </select>
              </div>

              {/* Mock File Picker */}
              <div>
                <label className="font-semibold text-text-main">Attachment File</label>
                <div className="mt-1 border-2 border-dashed border-border-subtle rounded-lg p-4 text-center hover:border-sky-400 transition-colors bg-surface-subtle/50 cursor-pointer">
                  <Upload className="w-5 h-5 text-sky-600 mx-auto mb-1" />
                  <span className="text-[11px] text-text-main font-medium">Click to select PDF or image</span>
                  <p className="text-[10px] text-text-muted mt-0.5">Maximum size: 25 MB (PDF, TIFF, PNG)</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-subtle border border-border-subtle text-text-main cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                >
                  Upload & File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

