import React, { useState } from 'react';
import { 
  Globe, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  AlertTriangle,
  Info,
  ChevronRight,
  Target
} from 'lucide-react';

const SECTORS = [
  { id: 'finance', name: 'Finance & Banking', avg: 1.2, info: 'Strict regulatory environments with low tolerance for structural variances.' },
  { id: 'retail', name: 'Retail & E-commerce', avg: 3.5, info: 'High-volume transaction sets with naturally higher seasonal anomaly profiles.' },
  { id: 'tech', name: 'Technology & SaaS', avg: 2.2, info: 'Characterized by variable billing cycles and high growth-related volatility.' },
  { id: 'health', name: 'Healthcare', avg: 1.5, info: 'High compliance needs; anomalies often indicate billing or procurement risks.' },
  { id: 'mfg', name: 'Manufacturing', avg: 2.8, info: 'Complex supply chains often result in higher frequency of outlier payments.' }
];

const SectorBenchmarking = ({ summary }) => {
  const [selectedSector, setSelectedSector] = useState(SECTORS[0]);
  
  const totalAnomalies = summary?.total_anomalies || 0;
  const totalRecords = summary?.total_records || 1;
  const companyRate = (totalAnomalies / totalRecords) * 100;
  
  const variance = companyRate - selectedSector.avg;
  const isOptimal = companyRate <= selectedSector.avg;
  const isCritical = companyRate > selectedSector.avg * 1.5;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-xl font-black text-white flex items-center tracking-tight uppercase">
            <Globe className="w-5 h-5 mr-3 text-indigo-400" />
            Industry Benchmarking
          </h3>
          <p className="text-xs text-gray-500 font-medium tracking-wide">Compare local anomaly density against global sectoral benchmarks</p>
        </div>
        
        <div className="px-4 py-2 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex items-center space-x-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Privacy Protected: Benchmarks Loaded Locally</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left: Sector Selection */}
        <div className="space-y-4">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Select Industry Sector</p>
          <div className="space-y-2">
            {SECTORS.map((sector) => (
              <button
                key={sector.id}
                onClick={() => setSelectedSector(sector)}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 group ${
                  selectedSector.id === sector.id 
                    ? 'bg-indigo-600/10 border-indigo-500/30 text-white shadow-lg shadow-indigo-600/5' 
                    : 'bg-white/[0.02] border-white/5 text-gray-500 hover:bg-white/[0.04] hover:text-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold tracking-tight">{sector.name}</span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${selectedSector.id === sector.id ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Center: Main Gauge */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[#11141b]/30 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px] -mr-32 -mt-32" />
            
            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              
              {/* Comparison Visual */}
              <div className="space-y-8 text-center md:text-left">
                <div className="space-y-2">
                  <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Forensic Parity Status</div>
                  <h4 className={`text-4xl font-black tracking-tighter ${isOptimal ? 'text-emerald-400' : isCritical ? 'text-red-400' : 'text-amber-400'}`}>
                    {isOptimal ? 'Within Threshold' : isCritical ? 'Critical Variance' : 'Elevated Risk'}
                  </h4>
                </div>
                
                <div className="flex items-center justify-center md:justify-start space-x-8">
                  <div className="text-center md:text-left">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Company Rate</p>
                    <p className="text-3xl font-black text-white">{companyRate.toFixed(2)}%</p>
                  </div>
                  <div className="h-10 w-[1px] bg-white/10 hidden md:block" />
                  <div className="text-center md:text-left">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Sector Avg</p>
                    <p className="text-3xl font-black text-indigo-400">{selectedSector.avg.toFixed(1)}%</p>
                  </div>
                </div>

                <div className={`inline-flex items-center space-x-3 px-5 py-2.5 rounded-2xl border ${isOptimal ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-orange-500/10 border-orange-500/20 text-orange-400'}`}>
                  {isOptimal ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  <span className="text-xs font-bold tracking-tight">
                    {isOptimal 
                      ? 'Performing above sector standards' 
                      : `${Math.abs(variance / selectedSector.avg * 100).toFixed(0)}% more anomalies than average`}
                  </span>
                </div>
              </div>

              {/* Graphical Bar */}
              <div className="space-y-6">
                 <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      <span>Forensic Intensity</span>
                      <span>Benchmarking Target</span>
                    </div>
                    <div className="h-4 w-full bg-white/5 rounded-full relative overflow-hidden">
                       {/* Intensity Fill */}
                       <div 
                         className={`absolute left-0 top-0 h-full transition-all duration-1000 ease-out rounded-full ${isOptimal ? 'bg-emerald-500' : 'bg-red-500'} shadow-[0_0_20px_rgba(16,185,129,0.3)]`}
                         style={{ width: `${Math.min(100, (companyRate / (selectedSector.avg * 2)) * 100)}%` }}
                       />
                       {/* Target Marker */}
                       <div className="absolute left-1/2 top-0 w-1 h-full bg-indigo-400 shadow-[0_0_10px_rgba(99,102,241,1)] z-20" />
                    </div>
                 </div>
                 <p className="text-xs text-gray-500 leading-relaxed italic font-medium">
                   <Info className="w-3 h-3 inline-block mr-1 opacity-50" />
                   {selectedSector.info}
                 </p>
              </div>

            </div>
          </div>

          {/* Detailed Insight Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex items-start space-x-4">
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
                <Target className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Sector Insight</p>
                <p className="text-xs text-gray-300 font-medium leading-relaxed">
                  Historical data for {selectedSector.name} suggests that anomalous patterns typically originate in procurement fraud (34%) or ghost vendor activities (21%).
                </p>
              </div>
            </div>
            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex items-start space-x-4">
              <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Audit Recommendation</p>
                <p className="text-xs text-gray-300 font-medium leading-relaxed">
                  Focus on the top {totalAnomalies} identified anomalies to revert the company rate back toward the optimal sector threshold of {selectedSector.avg}%.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SectorBenchmarking;
