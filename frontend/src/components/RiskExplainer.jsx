import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  ExternalLink, 
  ChevronRight, 
  BarChart3, 
  Info,
  Activity,
  User,
  ShoppingBag,
  Search
} from 'lucide-react';

const RiskExplainer = ({ riskScores = [] }) => {
  const [selectedItem, setSelectedItem] = useState(riskScores[0] || null);

  const getSeverityColor = (score) => {
    if (score > 70) return 'text-red-400 bg-red-400/10 border-red-400/20';
    if (score > 40) return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    return 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20';
  };

  const formatReason = (reason) => {
    return reason.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-white flex items-center">
            <Search className="w-5 h-5 mr-3 text-indigo-400" />
            Explainable Risk Insights
          </h3>
          <p className="text-xs text-gray-500 font-medium tracking-wide">De-masking forensic findings for legal and audit defense</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* List of Flagged Items */}
        <div className="lg:col-span-4 space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2 mb-2">High Risk Priority Queue</div>
          {riskScores.length > 0 ? (
            riskScores.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedItem(item)}
                className={`w-full text-left p-5 rounded-[2rem] border transition-all duration-300 group relative ${
                  selectedItem?.transaction_ref === item.transaction_ref
                    ? 'bg-indigo-600/10 border-indigo-500/30'
                    : 'bg-[#11141b]/40 border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-gray-500 tracking-tighter uppercase font-mono">{item.transaction_ref}</span>
                  <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${getSeverityColor(item.score)}`}>
                    Score: {item.score}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-gray-300">Anomaly #{item.row_index}</p>
                    <ChevronRight className={`w-4 h-4 transition-transform ${selectedItem?.transaction_ref === item.transaction_ref ? 'translate-x-1 text-indigo-400' : 'text-gray-600'}`} />
                </div>
              </button>
            ))
          ) : (
            <div className="p-12 text-center text-gray-600 bg-white/5 rounded-3xl border border-dashed border-white/5">
                <p className="text-xs uppercase font-black tracking-widest">No Priority Alerts</p>
                <p className="text-[10px] mt-2 leading-relaxed italic">Current dataset does not contain transactions exceeding high-risk thresholds.</p>
            </div>
          )}
        </div>

        {/* Breakdown Detail View */}
        <div className="lg:col-span-8">
          {selectedItem ? (
            <div className="bg-[#11141b]/60 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 h-full shadow-2xl relative overflow-hidden group">
                <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-8">
                        <div>
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-2">Evidence Breakdown</span>
                            <h4 className="text-2xl font-black text-white uppercase tracking-tight truncate max-w-[400px]">Analysis of {selectedItem.transaction_ref}</h4>
                        </div>
                        <div className="bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20">
                            <BarChart3 className="w-6 h-6 text-indigo-400" />
                        </div>
                    </div>

                    <div className="space-y-8 flex-1">
                        {/* Breakdown Chart */}
                        <div className="space-y-6">
                            {Object.entries(selectedItem.contribution || {}).sort((a,b) => b[1] - a[1]).map(([reason, pct], idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="flex justify-between items-center px-1">
                                        <div className="flex items-center space-x-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${idx === 0 ? 'bg-indigo-400' : 'bg-gray-600'}`} />
                                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-tight">{formatReason(reason)}</span>
                                        </div>
                                        <span className="text-xs font-black text-white">{pct}%</span>
                                    </div>
                                    <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000 ${idx === 0 ? 'bg-indigo-500' : 'bg-gray-700'}`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Defendable Insight Card */}
                        <div className="mt-12 p-6 bg-white/[0.03] border border-white/5 rounded-3xl">
                            <div className="flex items-center space-x-2 text-indigo-400 mb-3">
                                <Info className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Forensic Justification</span>
                            </div>
                            <p className="text-sm text-gray-400 leading-relaxed italic">
                                This transaction represents a high-risk outlier primarily due to {Object.keys(selectedItem.contribution)[0]} patterns. The weighted score of {selectedItem.score} indicates a significant violation of standard peer group behavior.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center bg-[#11141b]/20 border border-dashed border-white/5 rounded-[3rem] p-12 text-center text-gray-600">
                <p className="max-w-xs font-medium">Select a flagged transaction from the priority queue to view the explainable risk breakdown.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiskExplainer;
