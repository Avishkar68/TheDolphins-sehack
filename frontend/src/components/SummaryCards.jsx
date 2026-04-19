import React from 'react';
import { 
  Users, 
  ShieldAlert, 
  Activity, 
  CheckCircle2, 
  TrendingUp,
  AlertTriangle,
  FileCheck
} from 'lucide-react';

const SummaryCards = ({ summary, reconciliation }) => {
  if (!summary || !reconciliation) return null;

  const {
    total_records,
    total_anomalies,
    high_risk_count,
    medium_risk_count,
    low_risk_count
  } = summary;

  const stats = [
    {
      label: 'Volume Monitored',
      value: total_records?.toLocaleString() || '0',
      icon: Users,
      color: 'blue',
      trend: 'Total Records Analyzed',
      subIcon: FileCheck
    },
    {
      label: 'AI Anomalies',
      value: total_anomalies || '0',
      icon: ShieldAlert,
      color: 'red',
      trend: `${((total_anomalies / total_records) * 100).toFixed(1)}% Anomaly Rate`,
      subIcon: AlertTriangle
    },
    {
      label: 'Critical Risk',
      value: high_risk_count || '0',
      icon: Activity,
      color: 'purple',
      trend: `${medium_risk_count} Medium Priority`,
      subIcon: TrendingUp
    },
    {
      label: 'Reconciliation',
      value: (() => {
        const ledgerTotal = (reconciliation.matched_count || 0) + (reconciliation.partial_count || 0) + (reconciliation.missing_count || 0);
        if (ledgerTotal === 0) return '0.0%';
        const coverage = (((reconciliation.matched_count || 0) + (reconciliation.partial_count || 0)) / ledgerTotal) * 100;
        return `${coverage.toFixed(1)}%`;
      })(),
      icon: CheckCircle2,
      color: 'emerald',
      trend: reconciliation.partial_count > 0 
        ? `${reconciliation.partial_count} Variances Detected` 
        : `${reconciliation.matched_count} Perfect Matches`,
      subIcon: reconciliation.partial_count > 0 ? AlertTriangle : CheckCircle2
    }
  ];

  const getColorStyles = (color) => {
    const styles = {
      blue: 'from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/20 ring-blue-500/10',
      red: 'from-red-500/20 to-orange-500/20 text-red-400 border-red-500/20 ring-red-500/10',
      purple: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/20 ring-purple-500/10',
      emerald: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/20 ring-emerald-500/10'
    };
    return styles[color];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, idx) => (
        <div 
          key={idx}
          className={`relative group overflow-hidden bg-gradient-to-br ${getColorStyles(stat.color)} border backdrop-blur-md rounded-3xl p-6 transition-all hover:-translate-y-1`}
        >
          {/* Background Glow */}
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors" />

          <div className="flex items-start justify-between">
            <div className={`p-3 rounded-2xl bg-white/10 shadow-inner`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-400 mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold tracking-tight text-white">{stat.value}</h3>
            </div>
          </div>

          <div className="mt-6 flex items-center space-x-2 text-xs font-semibold">
            <stat.subIcon className="w-4 h-4" />
            <span className="text-white/80">{stat.trend}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
