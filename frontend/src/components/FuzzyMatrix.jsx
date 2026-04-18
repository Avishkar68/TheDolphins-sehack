import React from 'react';
import { Ghost, AlertTriangle, ArrowRightLeft, ShieldAlert } from 'lucide-react';

const FuzzyMatrix = ({ matches }) => {
  if (!matches || matches.length === 0) {
    return (
      <div className="bg-[#11141b]/30 border border-white/5 rounded-3xl p-12 flex flex-col items-center justify-center space-y-4 opacity-50">
        <Ghost className="w-12 h-12 text-gray-700" />
        <p className="text-gray-500 font-medium">No fuzzy entity overlaps detected in vendor registry</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-bold text-white flex items-center">
                <Ghost className="w-5 h-5 mr-3 text-amber-400" />
                Fuzzy Entity Reconciliation
            </h3>
            <div className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-black text-amber-400 uppercase tracking-widest">
                Potential Ghost Vendors Detected
            </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {matches.map((match, idx) => (
          <div key={idx} className="bg-[#11141b]/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6 flex flex-col space-y-4 hover:border-amber-500/30 transition-all group">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <ShieldAlert className="w-4 h-4 text-amber-500" />
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Similarity Score: {match.similarity}%</span>
                </div>
            </div>
            
            <div className="flex items-center justify-between bg-black/20 p-4 rounded-xl border border-white/5">
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-gray-600 uppercase mb-1">Entity A</span>
                    <span className="text-sm font-bold text-white">{match.entity1}</span>
                </div>
                <ArrowRightLeft className="w-4 h-4 text-amber-400/50" />
                <div className="flex flex-col text-right">
                    <span className="text-[9px] font-black text-gray-600 uppercase mb-1">Entity B</span>
                    <span className="text-sm font-bold text-white">{match.entity2}</span>
                </div>
            </div>

            <p className="text-[10px] text-gray-400 font-medium leading-relaxed italic">
                Identified through mnemonic overlap analysis. These entities may be part of a circular billing ring intended to bypass internal single-vendor controls.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FuzzyMatrix;
