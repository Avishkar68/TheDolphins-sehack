import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Line,
  ComposedChart,
  Legend,
  Cell
} from 'recharts';
import { BarChart as BarChartIcon, Info, AlertTriangle, ShieldCheck } from 'lucide-react';

const FrequencyCharts = ({ data }) => {
  if (!data || data.length === 0) return null;

  // Calculate deviation for visual feedback
  const chartData = data.map(item => ({
    ...item,
    deviation: Math.abs(item.actual - item.target),
    isSignificant: Math.abs(item.actual - item.target) > 5 // Mark as significant if > 5% diff
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dev = (payload[0].value - payload[1].value).toFixed(1);
      return (
        <div className="bg-[#1a1e28] border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-xl">
          <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Digit: {label}</p>
          <div className="space-y-1">
            <div className="flex justify-between items-center space-x-8">
              <span className="text-sm text-gray-300">Actual Density</span>
              <span className="text-sm font-bold text-white">{payload[0].value}%</span>
            </div>
            <div className="flex justify-between items-center space-x-8">
              <span className="text-sm text-gray-500">Benford Target</span>
              <span className="text-sm font-bold text-indigo-400">{payload[1].value}%</span>
            </div>
          </div>
          <div className={`mt-3 pt-2 border-t border-white/5 text-[10px] font-bold uppercase tracking-wider ${Math.abs(dev) > 5 ? 'text-red-400' : 'text-emerald-400'}`}>
            Deviation: {dev}%
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between">
            <div className="space-y-1">
                <h3 className="text-xl font-bold text-white flex items-center">
                <BarChartIcon className="w-5 h-5 mr-3 text-indigo-400" />
                Digital Frequency Profiling
                </h3>
                <p className="text-xs text-gray-500 font-medium">Analyzing leading digits against Benford's Law distribution (Logarithmic Expectation)</p>
            </div>
            
            <div className="flex items-center space-x-3 bg-indigo-500/5 border border-indigo-500/10 px-4 py-2 rounded-xl">
                 <ShieldCheck className="w-4 h-4 text-indigo-400" />
                 <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Validating Mathematical Authenticity</span>
            </div>
      </div>

      <div className="bg-[#11141b]/30 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-xl overflow-hidden relative">
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
              <XAxis 
                dataKey="digit" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 700 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 500 }}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff05' }} />
              <Legend 
                verticalAlign="top" 
                align="right" 
                iconType="circle"
                wrapperStyle={{ paddingBottom: '30px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}
              />
              <Bar 
                name="Actual Density" 
                dataKey="actual" 
                barSize={40} 
                radius={[6, 6, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.isSignificant ? '#f87171' : '#6366f1'} 
                    fillOpacity={entry.isSignificant ? 0.3 : 0.8}
                    stroke={entry.isSignificant ? '#f87171' : 'none'}
                    strokeWidth={1}
                  />
                ))}
              </Bar>
              <Line 
                name="Benford Target" 
                type="monotone" 
                dataKey="target" 
                stroke="#6366f1" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#0a0c10', strokeWidth: 2, stroke: '#6366f1' }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <DevCard 
          label="Max Positive Dev" 
          value={`+${Math.max(...chartData.map(d => d.actual - d.target)).toFixed(1)}%`}
          sub="Potential Oversaturation"
        />
        <DevCard 
          label="Max Negative Dev" 
          value={`${Math.min(...chartData.map(d => d.actual - d.target)).toFixed(1)}%`}
          sub="Missing Probabilities"
        />
        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl flex flex-col items-center justify-center space-y-2">
            <Info className="w-5 h-5 text-gray-500" />
            <p className="text-[10px] text-gray-500 font-bold uppercase leading-relaxed tracking-wider">
                Note: Deviations &gt; 5% in leading digits often indicate human fabrication of transactional data.
            </p>
        </div>
      </div>
    </div>
  );
};

const DevCard = ({ label, value, sub }) => (
    <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl group hover:border-indigo-500/20 transition-all">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{label}</p>
        <h4 className="text-2xl font-black text-white">{value}</h4>
        <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mt-1 opacity-60">{sub}</p>
    </div>
);

export default FrequencyCharts;
