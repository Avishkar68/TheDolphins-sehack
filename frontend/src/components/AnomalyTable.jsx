import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, ChevronRight, Search, FileDown } from 'lucide-react';

const AnomalyTable = ({ anomalies, riskScores }) => {
  const [activeTab, setActiveTab] = useState('anomalies');

  if (!anomalies || !riskScores) return null;

  const data = activeTab === 'anomalies' ? anomalies : riskScores;

  return (
    <div className="bg-[#11141b]/50 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden flex flex-col h-full shadow-2xl">
      {/* Table Header */}
      <div className="p-8 border-b border-white/5 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-xl font-bold text-white flex items-center">
            {activeTab === 'anomalies' ? (
              <ShieldAlert className="w-5 h-5 mr-3 text-indigo-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 mr-3 text-amber-400" />
            )}
            Audit Intelligence Log
          </h3>
          <div className="flex items-center space-x-2">
            <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 transition-colors">
              <Search className="w-4 h-4" />
            </button>
            <button className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 text-xs font-bold transition-all">
              <FileDown className="w-4 h-4" />
              <span>Export Audit</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1.5 bg-black/20 rounded-2xl w-full max-w-md">
          <button
            onClick={() => setActiveTab('anomalies')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'anomalies' 
                ? 'bg-[#1a1e28] text-white shadow-lg shadow-black/50' 
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <span>Top AI Anomalies</span>
            <span className="bg-indigo-500/20 text-indigo-400 px-2 rounded-md">{anomalies.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('risk_scores')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'risk_scores' 
                ? 'bg-[#1a1e28] text-white shadow-lg shadow-black/50' 
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <span>High Risk Scores</span>
            <span className="bg-amber-500/20 text-amber-400 px-2 rounded-md">{riskScores.length}</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black/10">
              <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Transaction Ref</th>
              <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Vendor / Entity</th>
              <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Amount</th>
              <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                {activeTab === 'anomalies' ? 'Anomaly Score' : 'Risk Weighted'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.map((row, idx) => (
              <tr key={idx} className="group hover:bg-white/[0.02] transition-colors cursor-pointer">
                <td className="px-8 py-4 pr-0">
                  <span className="text-sm font-mono text-indigo-400/80 group-hover:text-indigo-400 transition-colors uppercase">
                    {row.Transaction_Ref || row.transaction_ref}
                  </span>
                </td>
                <td className="px-8 py-4">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">
                      {row.Vendor_Name || 'System Process'}
                    </p>
                    {activeTab === 'risk_scores' && (
                      <div className="flex flex-wrap gap-1">
                        {row.reasons?.map((reason, ridx) => (
                          <span key={ridx} className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500/80 font-bold uppercase">
                            {reason}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-8 py-4">
                  <span className="text-sm font-bold text-gray-300">
                    ${(row.Amount || 0).toLocaleString()}
                  </span>
                </td>
                <td className="px-8 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden max-w-[60px]">
                      <div 
                        className={`h-full rounded-full ${activeTab === 'anomalies' ? 'bg-indigo-500' : 'bg-amber-500'}`}
                        style={{ width: `${activeTab === 'anomalies' ? (Math.abs(row.anomaly_score) * 100) : row.score}%` }}
                      />
                    </div>
                    <span className={`text-xs font-mono font-bold ${activeTab === 'anomalies' ? 'text-indigo-400' : 'text-amber-400'}`}>
                      {activeTab === 'anomalies' ? row.anomaly_score?.toFixed(3) : row.score}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-6 bg-black/10 border-t border-white/5 flex items-center justify-between">
        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
          Showing top {data.length} priority items
        </p>
        <button className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest hover:underline flex items-center group">
          Load Full Log <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default AnomalyTable;
