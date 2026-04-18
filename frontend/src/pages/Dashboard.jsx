import React, { useState } from 'react';
import UploadSection from '../components/UploadSection';
import SummaryCards from '../components/SummaryCards';
import ChartsSection from '../components/ChartsSection';
import AnomalyTable from '../components/AnomalyTable';
import { AlertCircle, Loader2, Sparkles } from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  return (
    <div className="min-h-screen bg-[#0a0c10] text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Container */}
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              AI-Powered Fraud Intelligence
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
            Financial Integrity Dashboard
          </h1>
          <p className="max-w-2xl mx-auto text-gray-400 text-lg">
            Detect anomalies, monitor vendor risks, and reconcile transactions with our integrated ML audit engine.
          </p>
        </div>

        {/* Upload Action Card */}
        <div className="bg-[#11141b]/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl transition-all group-hover:bg-indigo-500/20" />
          <UploadSection 
            setData={setData} 
            setLoading={setLoading} 
            setError={setError} 
          />
        </div>

        {/* Status Indicators */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
            <p className="text-gray-400 animate-pulse font-medium">Analyzing deep financial patterns...</p>
          </div>
        )}

        {error && (
          <div className="flex items-center space-x-3 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-red-400 animate-in fade-in slide-in-from-top-4">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Results Sections */}
        {!data && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-gray-800 rounded-3xl opacity-50">
            <p className="text-gray-500 text-lg">Upload files to start analysis</p>
          </div>
        )}

        {data && !loading && (
          <div className="space-y-12 animate-in fade-in zoom-in-95 duration-700">
            
            {/* Global Metrics */}
            <SummaryCards 
              summary={data.summary} 
              reconciliation={data.reconciliation} 
            />

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ChartsSection 
                charts={data.charts} 
                reconciliation={data.reconciliation} 
                insights={data.insights}
              />
              
              <div className="space-y-8">
                 <AnomalyTable 
                    anomalies={data.anomalies} 
                    riskScores={data.risk_scores} 
                  />
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
