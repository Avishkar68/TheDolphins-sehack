import React from 'react';
import {
  Shield,
  Database,
  Map,
  BarChart,
  Scale,
  MessageSquare,
  Activity,
  FileText,
  Search,
  Globe
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'integrity', icon: Database, label: 'Readiness Monitor' },
    { id: 'overview', icon: Activity, label: 'Analytics Hub' },
    { id: 'forensic', icon: Map, label: 'Relational Graph' },
    { id: 'benford', icon: BarChart, label: 'Frequency Stats' },
    { id: 'recon', icon: Scale, label: 'Recon Audit' },
    { id: 'bank-comparison', icon: FileText, label: 'Bank Comparison' },
    { id: 'resilience', icon: Shield, label: 'Resilience Test' },
    { id: 'benchmarking', icon: Globe, label: 'Sector Benchmarking' },
    { id: 'memo', icon: MessageSquare, label: 'Audit Sidekick' },
    { id: 'explain', icon: Search, label: 'Explainable Risk' },
  ];

  return (
    <div className="w-70 h-screen sticky top-0 bg-[#0d1117]/80 backdrop-blur-2xl border-r border-white/5 flex flex-col pt-8 z-30">
      {/* Branding */}
      <div className="px-6 mb-12">
        <div className="flex items-center space-x-3 group cursor-pointer">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 group-hover:bg-indigo-500/20 group-hover:border-indigo-500/40 transition-all duration-500">
            <Shield className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-white group-hover:text-indigo-400 transition-colors">LEDGER<span className="text-indigo-400 group-hover:text-white transition-colors">SPY</span></h1>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest opacity-80">Forensic Sidekick</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 relative group overflow-hidden ${isActive
                ? 'bg-indigo-600/10 text-white border border-indigo-500/30'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.03] border border-transparent'
                }`}
            >
              {/* Active Indicator Glow */}
              {isActive && (
                <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.8)]" />
              )}

              <item.icon className={`w-4 h-4 transition-colors ${isActive ? 'text-indigo-400' : 'group-hover:text-gray-300'}`} />
              <span className="relative z-10">{item.label}</span>

              {/* Subtle hover shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shine" />
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-6 border-t border-white/5 space-y-4 bg-black/20">
        <div className="bg-emerald-500/5 group p-4 rounded-2xl border border-emerald-500/10 flex items-center space-x-3 hover:bg-emerald-500/10 transition-all cursor-help">
          <div className="relative">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping opacity-40" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Air-Gapped Mode</span>
            <span className="text-[8px] font-bold text-gray-600 uppercase">Local AI Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
