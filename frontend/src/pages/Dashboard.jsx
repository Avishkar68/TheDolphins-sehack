import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UploadSection from '../components/UploadSection';
import SummaryCards from '../components/SummaryCards';
import ChartsSection from '../components/ChartsSection';
import AnomalyTable from '../components/AnomalyTable';
import PreviewTable from '../components/PreviewTable';
import { AlertCircle, Loader2, Sparkles, Database } from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination State
  const [previews, setPreviews] = useState({
    ledger: { data: [], pagination: { page: 1, total_pages: 1 } },
    bank: { data: [], pagination: { page: 1, total_pages: 1 } }
  });
  const [focusedRow, setFocusedRow] = useState(null); // { index, type }

  const fetchPreview = async (type, page = 1) => {
    try {
      const resp = await axios.get(`http://localhost:4000/api/upload/preview?type=${type}&page=${page}&limit=100`);
      setPreviews(prev => ({
        ...prev,
        [type]: {
          data: resp.data.data,
          pagination: {
            page: resp.data.page,
            total_pages: resp.data.total_pages,
            total_rows: resp.data.total_rows
          }
        }
      }));
    } catch (err) {
      console.error(`Failed to fetch ${type} preview:`, err);
    }
  };

  // Initial fetch on data load
  useEffect(() => {
    if (data && data.success) {
      fetchPreview('ledger', 1);
      fetchPreview('bank', 1);
    }
  }, [data]);

  const handleNavigateToIssue = async (issue) => {
    const type = issue.source || 'ledger';
    const rowIndex = issue.row_index;
    const targetPage = Math.ceil(rowIndex / 100);

    // If not on the correct page, fetch it first
    if (previews[type].pagination.page !== targetPage) {
      await fetchPreview(type, targetPage);
    }
    
    // Set focus
    setFocusedRow({ index: rowIndex, type });

    // Scroll table into view
    const element = document.getElementById(`${type}-explorer`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Container */}
      <div className="max-w-7xl mx-auto space-y-12">
        
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
        </div>

        {/* Upload Action Card */}
        <div className="bg-[#11141b]/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
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
          <div className="flex items-center space-x-3 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {data && !loading && (
          <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-700 w-full">
            
            {/* Global Metrics - Already formatted as cards inside SummaryCards component usually, 
                but we'll ensure they fit the full width here */}
            <div className="w-full">
              <SummaryCards 
                summary={data.summary} 
                reconciliation={data.reconciliation} 
              />
            </div>

            {/* Top 10 High-Volume Vendors Section */}
            <div className="w-full bg-[#11141b]/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-xl overflow-hidden">
              <ChartsSection 
                charts={data.charts} 
                reconciliation={data.reconciliation} 
                insights={data.insights}
              />
            </div>
            
            {/* Audit Issues Registry Section */}
            <div className="w-full bg-[#11141b]/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-xl overflow-hidden">
              <AnomalyTable 
                issues={data.issues} 
                onNavigate={handleNavigateToIssue}
              />
            </div>

            {/* Source Data Explorers */}
            <div className="space-y-6">
              <div id="ledger-explorer" className="w-full bg-[#11141b]/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-xl overflow-hidden">
                <PreviewTable 
                  type="ledger"
                  data={previews.ledger.data}
                  pagination={previews.ledger.pagination}
                  onPageChange={(p) => fetchPreview('ledger', p)}
                  issues={data.issues}
                  focusedRowIndex={focusedRow?.type === 'ledger' ? focusedRow.index : null}
                />
              </div>

              <div id="bank-explorer" className="w-full bg-[#11141b]/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-xl overflow-hidden">
                <PreviewTable 
                  type="bank"
                  data={previews.bank.data}
                  pagination={previews.bank.pagination}
                  onPageChange={(p) => fetchPreview('bank', p)}
                  issues={data.issues}
                  focusedRowIndex={focusedRow?.type === 'bank' ? focusedRow.index : null}
                />
              </div>
            </div>
          </div>
        )}

        {!data && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-gray-800 rounded-3xl opacity-50">
            <p className="text-gray-500 text-lg font-medium">Upload datasets to initiate forensic intelligence</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
