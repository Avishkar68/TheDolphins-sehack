import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Search, 
  Filter, 
  ArrowRightLeft,
  ChevronDown,
  Info
} from 'lucide-react';

const BankReconView = ({ reconciliationList = [] }) => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredData = reconciliationList.filter(item => {
    const matchesFilter = filter === 'all' || item.status === filter;
    const matchesSearch = item.ref.toLowerCase().includes(search.toLowerCase()) || 
                         item.vendor.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    matched: reconciliationList.filter(i => i.status === 'matched').length,
    partial: reconciliationList.filter(i => i.status === 'partial').length,
    missing: reconciliationList.filter(i => i.status === 'missing').length,
    unrecognized: reconciliationList.filter(i => i.status === 'unrecognized').length
  };

  const statusConfig = {
    matched: { icon: CheckCircle2, bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', label: 'Verified' },
    partial: { icon: AlertTriangle, bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', label: 'Mismatch' },
    missing: { icon: XCircle, bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', label: 'Missing' },
    unrecognized: { icon: Info, bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-400', label: 'Unrecorded' }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header & Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-xl font-black text-white flex items-center tracking-tight uppercase">
            <ArrowRightLeft className="w-5 h-5 mr-3 text-indigo-400" />
            Bank Statement Reconciliation
          </h3>
          <p className="text-xs text-gray-500 font-medium tracking-wide">Automated side-by-side vouching and evidence verification</p>
        </div>

        <div className="flex items-center space-x-3">
          <StatBadge count={stats.matched} color="emerald" label="Matched" />
          <StatBadge count={stats.partial} color="amber" label="Mismatch" />
          <StatBadge count={stats.missing} color="red" label="Missing" />
          <StatBadge count={stats.unrecognized} color="indigo" label="Unrecorded" />
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
          <input 
            type="text"
            placeholder="Search by reference or vendor..."
            className="w-full bg-[#11141b]/40 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2 bg-[#11141b]/40 border border-white/5 rounded-2xl p-1.5 flex-wrap">
          {['all', 'matched', 'partial', 'missing', 'unrecognized'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === s ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {s === 'unrecognized' ? 'unrecorded' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Side-by-Side Table */}
      <div className="bg-[#11141b]/30 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Forensic Ref / Vendor</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Ledger Amount</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Bank Amount</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Vouching Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredData.map((item, idx) => {
                const config = statusConfig[item.status];
                const StatusIcon = config.icon;

                return (
                  <tr key={idx} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <div className="text-sm font-black text-white font-mono tracking-tight">{item.ref}</div>
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{item.vendor}</div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="text-sm font-black text-white tracking-tight">
                        ${item.ledger_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className={`px-8 py-6 text-center ${item.status === 'missing' ? 'opacity-30' : ''}`}>
                      {item.bank_amount !== null ? (
                        <span className={`text-sm font-black tracking-tight ${item.status === 'partial' ? 'text-amber-400' : 'text-white'}`}>
                          ${item.bank_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span className="text-[10px] font-black text-red-500 uppercase italic">Not Found</span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center">
                        <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border ${config.bg} ${config.border} ${config.text}`}>
                          <StatusIcon className="w-3 h-3" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{config.label}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center text-gray-500 font-medium">
                    No records matching current filters. Check ingestion readiness.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forensic Tip */}
      <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl flex items-start space-x-4">
        <Info className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
        <p className="text-xs text-gray-400 leading-relaxed italic">
          <strong>Note:</strong> Partial matches (Yellow) are flagged based on a variance threshold. Transactions missing bank evidence (Red) are high-priority findings and should be investigated for potential unrecorded outflows or fictitious procurement.
        </p>
      </div>
    </div>
  );
};

const StatBadge = ({ count, color, label }) => (
  <div className={`px-4 py-2 rounded-2xl bg-${color}-500/10 border border-${color}-500/20 flex flex-col items-center min-w-[80px]`}>
    <span className={`text-lg font-black text-${color}-400`}>{count}</span>
    <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
  </div>
);

export default BankReconView;
