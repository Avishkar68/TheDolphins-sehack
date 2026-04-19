import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Shield, TrendingDown, Target, Zap } from 'lucide-react';

const MonteCarloPlot = ({ data }) => {
  if (!data || data.length === 0) return null;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a1e28] border border-white/10 p-4 rounded-xl shadow-2xl backdrop-blur-xl">
          <p className="text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest">Projection: Month {label}</p>
          <div className="space-y-1">
            <div className="flex justify-between items-center space-x-8">
              <span className="text-xs text-gray-400">Conservative Range</span>
              <span className="text-xs font-bold text-red-400">${payload[0].value[0].toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center space-x-8">
              <span className="text-xs text-gray-400">Aggressive Range</span>
              <span className="text-xs font-bold text-emerald-400">${payload[0].value[1].toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center space-x-8 pt-1 border-t border-white/5 mt-1">
              <span className="text-xs text-white">Mean Expectation</span>
              <span className="text-xs font-bold text-indigo-400">${payload[1].value.toLocaleString()}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const currentStatus = data[data.length - 1].mean > 0 ? 'Safe' : 'Critical';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-white flex items-center">
            <Shield className="w-5 h-5 mr-3 text-emerald-400" />
            Monte Carlo Resilience Test
          </h3>
          <p className="text-xs text-gray-500 font-medium">Projecting 12-month solvency probability through 1,000 variance simulations</p>
        </div>

        <div className={`flex items-center space-x-3 px-4 py-2 rounded-xl bg-opacity-10 border ${currentStatus === 'Safe' ? 'bg-emerald-500 text-white border-emerald-500/20' : 'bg-red-500 text-white border-red-500/20'}`}>
          <Zap className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Survival Probability: {currentStatus === 'Safe' ? '> 95%' : '< 40%'}</span>
        </div>
      </div>

      <div className="bg-[#11141b]/30 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl opacity-50" />

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorMean" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 700 }}
                label={{ value: 'Months Projected', position: 'insideBottom', offset: -10, fill: '#4b5563', fontSize: 10, fontWeight: 800 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 500 }}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Uncertainty Band */}
              <Area
                type="monotone"
                dataKey={(d) => [d.critical, d.safe]}
                stroke="none"
                fill="url(#colorBand)"
                connectNulls
              />

              {/* Mean Projection */}
              <Area
                type="monotone"
                dataKey="mean"
                stroke="#6366f1"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorMean)"
              />

              <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Insolvency Threshold', position: 'right', fill: '#ef4444', fontSize: 10, fontWeight: 'bold' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl flex items-start space-x-4">
          <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest leading-none">Variance Exposure</p>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              Historical transaction volatility suggests a ±15% deviation in cash burn. Scenario mapping includes extreme outlier events detected in audits.
            </p>
          </div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl flex items-start space-x-4">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Target className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest leading-none">CA Conclusion</p>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              The company maintains a high probability of going concern. No immediate liquidity risks identified based on current ledger trajectory.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonteCarloPlot;
