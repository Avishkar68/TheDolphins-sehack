import React from 'react';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ShieldCheck,
  Zap
} from 'lucide-react';

const IntegrityMonitor = ({ readiness }) => {
  if (!readiness) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Readiness Score Card */}
      <div className="bg-[#11141b]/30 backdrop-blur-xl border border-white/5 rounded-3xl p-10 flex items-center justify-between shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all duration-700" />

        <div className="space-y-4 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Forensic Integrity Score</span>
          </div>
          <h2 className="text-5xl font-black text-white tracking-tighter">
            Dataset is <span className={readiness.score > 80 ? 'text-emerald-400' : 'text-amber-400'}>{readiness.score}%</span> Ready
          </h2>
          <p className="text-gray-500 max-w-md font-medium text-sm leading-relaxed">
            Data integrity verification is essential for legal defensibility. We've audited your file formats, null densities, and record continuity.
          </p>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-40 h-40 rounded-full border-8 border-white/5 flex items-center justify-center relative">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="8"
                className="text-emerald-500/20"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={440}
                strokeDashoffset={440 - (440 * readiness.score) / 100}
                strokeLinecap="round"
                className="text-emerald-500 transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap className="w-10 h-10 text-emerald-400 fill-emerald-400/20" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Completeness Metrics */}
        <div className="bg-[#11141b]/30 backdrop-blur-xl border border-white/5 rounded-3xl p-8 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center">
            <FileCheck className="w-5 h-5 mr-3 text-indigo-400" />
            Structural Completeness
          </h3>
          <div className="space-y-4">
            <MetricBar label="Ledger Data Continuity" value={readiness.metrics.ledger_completeness} color="indigo" />
            <MetricBar label="Bank Proofing Coverage" value={readiness.metrics.bank_completeness} color="emerald" />
          </div>
        </div>

        {/* Issue Categorization */}
        <div className="bg-[#11141b]/30 backdrop-blur-xl border border-white/5 rounded-3xl p-8 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center">
            <AlertCircle className="w-5 h-5 mr-3 text-red-400" />
            Integrity Findings
          </h3>
          <div className="space-y-3">
            {readiness.issues.length > 0 ? readiness.issues.map((issue, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${issue.count > 0 ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                  <span className="text-sm font-bold text-gray-300">{issue.category}</span>
                </div>
                <span className="text-xs font-black font-mono text-gray-500 uppercase">{issue.count} Found IN {issue.type}</span>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-6 space-y-2 opacity-50">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">No structural issues detected</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricBar = ({ label, value, color }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
      <span className="text-gray-500">{label}</span>
      <span className={`text-${color}-400`}>{value}%</span>
    </div>
    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
      <div
        className={`h-full bg-${color}-500 transition-all duration-1000 rounded-full`}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

export default IntegrityMonitor;
