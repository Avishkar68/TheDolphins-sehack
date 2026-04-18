import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  ChevronRight, 
  Search, 
  FileDown, 
  X, 
  Layers, 
  Eye,
  Info,
  LayoutGrid,
  Code,
  MapPin,
  Database
} from 'lucide-react';

const AnomalyTable = ({ issues, onNavigate }) => {
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [viewMode, setViewMode] = useState('formatted'); // 'formatted' | 'raw'

  if (!issues) return null;

  const getSeverityBadge = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'low':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return <ShieldAlert className="w-3 h-3 mr-1.5" />;
      case 'medium':
        return <AlertTriangle className="w-3 h-3 mr-1.5" />;
      case 'low':
        return <Info className="w-3 h-3 mr-1.5" />;
      default:
        return null;
    }
  };

  return (
    <div className="overflow-hidden flex flex-col h-full w-full">
      {/* Table Header */}
      <div className="p-8 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-xl font-bold text-white flex items-center">
          <Layers className="w-5 h-5 mr-3 text-indigo-400" />
          Audit Issues Registry
        </h3>
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 text-xs font-bold transition-all">
            <FileDown className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black/10">
              <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Row</th>
              <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Source</th>
              <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Issue</th>
              <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Severity</th>
              <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {issues.slice(0, 50).map((issue, idx) => (
              <tr 
                key={idx} 
                className="group hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-8 py-5">
                  <span className="text-sm font-mono text-gray-500 group-hover:text-gray-300">#{issue.row_index}</span>
                </td>
                <td className="px-8 py-5 text-center">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                    issue.source === 'bank' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                  }`}>
                    {issue.source || 'ledger'}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <span className="text-sm font-medium text-gray-300 group-hover:text-white">
                    {issue.message}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getSeverityBadge(issue.severity)}`}>
                    {getSeverityIcon(issue.severity)}
                    {issue.severity}
                  </span>
                </td>
                <td className="px-8 py-5 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <button 
                      onClick={() => {
                        setSelectedIssue(issue);
                        setViewMode('formatted');
                      }}
                      title="View Details"
                      className="p-2 rounded-lg bg-white/5 hover:bg-indigo-500/20 text-gray-400 hover:text-indigo-400 transition-all border border-transparent hover:border-indigo-500/30"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onNavigate(issue)}
                      title="Jump to Source"
                      className="p-2 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-gray-400 hover:text-emerald-400 transition-all border border-transparent hover:border-emerald-500/30"
                    >
                      <MapPin className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md" 
            onClick={() => setSelectedIssue(null)}
          />
          <div className="relative bg-[#0f1218] border border-white/10 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center space-x-3">
                <span className={`w-2 h-2 rounded-full animate-pulse ${selectedIssue.severity === 'high' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Row {selectedIssue.row_index} — <span className="capitalize">{selectedIssue.severity} Risk</span> ⚠
                </h2>
              </div>
              <button 
                onClick={() => setSelectedIssue(null)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 transition-all hover:rotate-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* View Mode Switcher */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-white/5 bg-black/20">
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setViewMode('formatted')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === 'formatted' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-white/5 text-gray-500 hover:text-gray-300'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span>Formatted</span>
                </button>
                <button 
                  onClick={() => setViewMode('raw')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === 'raw' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-white/5 text-gray-500 hover:text-gray-300'}`}
                >
                  <Code className="w-4 h-4" />
                  <span>Raw JSON</span>
                </button>
              </div>

              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Source: {selectedIssue.source || 'ledger'}
                </span>
              </div>
            </div>

            <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {viewMode === 'formatted' ? (
                <div className="space-y-6">
                  {/* Alert Box */}
                  <div className={`p-4 rounded-2xl border ${selectedIssue.severity === 'high' ? 'bg-red-500/5 border-red-500/20 text-red-400' : 'bg-yellow-500/5 border-yellow-500/20 text-yellow-400'}`}>
                    <p className="text-xs font-bold uppercase tracking-widest mb-1 opacity-60">Detected Issue</p>
                    <p className="text-sm font-medium leading-relaxed">{selectedIssue.message}</p>
                  </div>

                  {/* Data Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <DetailItem 
                      label="Transaction Ref" 
                      value={selectedIssue.details?.Transaction_Ref} 
                    />
                    <DetailItem 
                      label="Vendor" 
                      value={selectedIssue.details?.Vendor_Name} 
                      isProblem={selectedIssue.field === 'Vendor_Name'}
                    />
                    <DetailItem 
                      label="Amount" 
                      value={`$${(selectedIssue.details?.Amount || 0).toLocaleString()}`} 
                      isProblem={selectedIssue.field === 'Amount'}
                    />
                    <DetailItem 
                      label="Approver" 
                      value={selectedIssue.details?.Approver_ID} 
                      isProblem={selectedIssue.field === 'Approver_ID'}
                    />
                    <DetailItem 
                      label="Category" 
                      value={selectedIssue.details?.Category} 
                      isProblem={selectedIssue.field === 'Category'}
                      fullWidth
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-black/40 rounded-2xl p-6 border border-white/5">
                  <pre className="text-xs font-mono text-indigo-300/70 leading-relaxed whitespace-pre-wrap">
                    {JSON.stringify(selectedIssue, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="p-6 bg-white/[0.02] border-t border-white/5 flex justify-between items-center gap-4">
               <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest leading-none">Status: Critical Risk</p>
               <div className="flex space-x-3">
                  <button 
                    onClick={() => onNavigate(selectedIssue)}
                    className="flex items-center space-x-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-600/20"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Jump to Source</span>
                  </button>
                  <button 
                    onClick={() => setSelectedIssue(null)}
                    className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-all border border-white/10"
                  >
                    Dismiss
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailItem = ({ label, value, isProblem, fullWidth }) => (
  <div className={`${fullWidth ? 'col-span-2' : ''} p-4 rounded-2xl bg-white/[0.02] border ${isProblem ? 'border-red-500/40 bg-red-500/5' : 'border-white/5'}`}>
    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1.5">{label}</p>
    <div className="flex items-center">
      {isProblem && <span className="mr-2 text-sm">🔴</span>}
      <p className={`text-sm font-bold truncate ${isProblem ? 'text-red-400' : 'text-gray-200'}`}>
        {value || 'N/A'}
      </p>
    </div>
  </div>
);

export default AnomalyTable;
