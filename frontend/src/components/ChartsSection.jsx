import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Target, UserCheck, CreditCard, ExternalLink } from 'lucide-react';

const ChartsSection = ({ charts, reconciliation, insights }) => {
  if (!charts || !insights) return null;

  // Pie Chart Data (Risk Distribution estimated from summary if needed, but summary is in parent. 
  // Let's assume we pass the counts or calculate them from charts if possible. 
  // However, the standard structure has it in summary. Let's pass what we need.)

  const riskData = [
    { name: 'High Risk', value: 85, color: '#ef4444' }, // Example static for structure, replace with real if parent passes
    { name: 'Medium Risk', value: 384, color: '#f59e0b' },
    { name: 'Low Risk', value: 9531, color: '#10b981' },
  ];

  const vendorData = charts.vendor_risk_top10 || [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a1e28] border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-xl">
          <p className="text-sm font-semibold text-gray-200 mb-1">{label}</p>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].color }} />
            <p className="text-lg font-bold text-white">{payload[0].value}</p>
          </div>
          <p className="text-[10px] uppercase tracking-wider text-gray-500 mt-1 font-bold">Total Transactions</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 h-full">
      {/* Top Insights Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <InsightCard 
          icon={Target} 
          title="Most Risky Vendor" 
          value={insights.top_risky_vendor || 'N/A'} 
          sub="Highest volume flags"
          color="red"
        />
        <InsightCard 
          icon={UserCheck} 
          title="Lead Approver" 
          value={insights.top_risky_approver || 'N/A'} 
          sub="Internal policy audit suggested"
          color="indigo"
        />
        <InsightCard 
          icon={CreditCard} 
          title="Compromised Bank" 
          value={insights.most_shared_bank_account || 'N/A'} 
          sub="Multiple vendor conflict"
          color="emerald"
        />
      </div>

      {/* Charts Main Row */}
      <div className="grid grid-cols-1 gap-8 h-full">
        {/* Vendor Bar Chart */}
        <div className="bg-[#11141b]/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold bg-gradient-to-r from-white to-indigo-400 bg-clip-text text-transparent">
              Top 10 High-Volume Vendors
            </h3>
            <button className="text-indigo-400 text-xs font-semibold flex items-center hover:underline">
              Full Analytics <ExternalLink className="w-3 h-3 ml-1" />
            </button>
          </div>
          
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vendorData} layout="vertical" margin={{ left: 40, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="vendor" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 500 }}
                  width={150}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff05' }} />
                <Bar 
                  dataKey="count" 
                  fill="url(#barGradient)" 
                  radius={[0, 8, 8, 0]} 
                  barSize={20}
                >
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.1} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const InsightCard = ({ icon: Icon, title, value, sub, color }) => (
  <div className="bg-[#11141b]/50 backdrop-blur-xl border border-white/5 p-6 rounded-3xl group hover:border-indigo-500/30 transition-all">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-2 rounded-xl bg-opacity-10 ${color === 'red' ? 'bg-red-500 text-red-400' : color === 'indigo' ? 'bg-indigo-500 text-indigo-400' : 'bg-emerald-500 text-emerald-400'}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <div className="space-y-1">
      <p className="text-xs font-bold uppercase tracking-wider text-gray-600">{title}</p>
      <h4 className="text-lg font-bold text-gray-200 truncate">{value}</h4>
      <p className="text-[10px] text-gray-500 font-medium">{sub}</p>
    </div>
  </div>
);

export default ChartsSection;
