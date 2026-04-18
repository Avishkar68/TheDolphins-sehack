import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import UploadSection from '../components/UploadSection';
import SummaryCards from '../components/SummaryCards';
import ChartsSection from '../components/ChartsSection';
import AnomalyTable from '../components/AnomalyTable';
import PreviewTable from '../components/PreviewTable';
import IntegrityMonitor from '../components/IntegrityMonitor';
import RiskExplainer from '../components/RiskExplainer';
import BankReconView from '../components/BankReconView';
import FrequencyCharts from '../components/FrequencyCharts';
import MonteCarloPlot from '../components/MonteCarloPlot';
import AuditMemoAssistant from '../components/AuditMemoAssistant';
import FuzzyMatrix from '../components/FuzzyMatrix';
import { AlertCircle, Loader2, Sparkles, Database, RefreshCw } from 'lucide-react';

// Error Boundary component for resilient UI
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error: error.message }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="h-[400px] flex flex-col items-center justify-center space-y-4 bg-red-500/5 rounded-3xl border border-red-500/10 p-8 text-center">
          <AlertCircle className="w-10 h-10 text-red-500 opacity-50" />
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">Module Initialization Failed</h3>
            <p className="text-xs text-red-400 font-mono bg-red-500/10 p-2 rounded mb-4 max-w-lg">{this.state.error}</p>
            <p className="text-sm text-gray-500 max-w-md">The forensic intelligence module encountered a conflict with the local browser environment. The rest of the suite remains active.</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center space-x-2 px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-all border border-white/10"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Restore Environment</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Lazy load the problematic graph library to prevent top-level initialization crashes
const ForensicMap = React.lazy(() => import('../components/ForensicMap'));

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('integrity');

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

    // Switch to appropriate preview tab
    setActiveTab('recon');

    // Scroll table into view (delayed slightly for tab switch)
    setTimeout(() => {
      const element = document.getElementById(`${type}-explorer`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const renderContent = () => {
    const Placeholder = ({ title, icon: Icon = Database }) => (
      <div className="flex flex-col items-center justify-center min-h-[500px] border border-white/5 bg-[#11141b]/20 backdrop-blur-xl rounded-[2.5rem] p-12 text-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-50" />
        <div className="relative z-10 space-y-6">
          <div className="inline-flex p-6 rounded-[2rem] bg-black/40 border border-white/10 shadow-2xl relative group-hover:scale-105 transition-transform duration-700">
            <div className="absolute inset-0 bg-indigo-500/10 blur-2xl rounded-full" />
            <Icon className="w-12 h-12 text-indigo-400 relative z-10" />
          </div>
          <div className="space-y-2">
            <h4 className="text-2xl font-black text-white tracking-tight uppercase">{title}</h4>
            <p className="text-gray-500 max-w-sm mx-auto font-medium leading-relaxed">
              Module integrity check complete. Please process your ledger and bank statements to initiate forensic intelligence mapping.
            </p>
          </div>
          <div className="flex items-center justify-center space-x-2 text-[10px] font-black text-indigo-400/50 uppercase tracking-[0.2em] pt-4">
            <span className="w-8 h-[1px] bg-indigo-500/20" />
            <span>Local Node Ready</span>
            <span className="w-8 h-[1px] bg-indigo-500/20" />
          </div>
        </div>
      </div>
    );

    switch (activeTab) {
      case 'overview':
        if (!data) return <Placeholder title="Forensic Hub" />;
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <SummaryCards
              summary={data.summary}
              reconciliation={data.reconciliation}
            />
            <div className="w-full bg-[#11141b]/30 backdrop-blur-md border border-white/5 rounded-3xl p-6 shadow-xl">
              <ChartsSection
                charts={data.charts}
                reconciliation={data.reconciliation}
                insights={data.insights}
              />
            </div>
            <div className="w-full bg-[#11141b]/30 backdrop-blur-md border border-white/5 rounded-3xl p-6 shadow-xl">
              <AnomalyTable
                issues={data.issues}
                onNavigate={handleNavigateToIssue}
              />
            </div>
          </div>
        );

      case 'integrity':
        if (!data) return <Placeholder title="Readiness Monitor" />;
        return <IntegrityMonitor readiness={data.forensic?.readiness} />;
      case 'forensic':
        if (!data) return <Placeholder title="Forensic Mapping" />;
        return (
          <div className="space-y-12">
            <FuzzyMatrix matches={data.forensic?.fuzzy_entities} />
            <ErrorBoundary>
              <React.Suspense fallback={
                <div className="h-[400px] flex flex-col items-center justify-center space-y-4 bg-black/20 rounded-3xl border border-white/5 opacity-50">
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                  <p className="text-gray-500 font-medium text-xs uppercase tracking-widest">Initializing Forensic Intelligence...</p>
                </div>
              }>
                <ForensicMap data={data.forensic?.relational_map} />
              </React.Suspense>
            </ErrorBoundary>
          </div>
        );
      case 'benford':
        if (!data) return <Placeholder title="Frequency Stats" />;
        return <FrequencyCharts data={data.forensic?.benford} />;

      case 'recon':
        if (!data) return <Placeholder title="Reconciliation Audit" />;
        return (
          <div className="space-y-12 animate-in fade-in duration-500">
            <div id="ledger-explorer">
              <PreviewTable
                type="ledger"
                data={previews.ledger.data}
                pagination={previews.ledger.pagination}
                onPageChange={(p) => fetchPreview('ledger', p)}
                issues={data?.issues || []}
                focusedRowIndex={focusedRow?.type === 'ledger' ? focusedRow.index : null}
              />
            </div>
            <div id="bank-explorer">
              <PreviewTable
                type="bank"
                data={previews.bank.data}
                pagination={previews.bank.pagination}
                onPageChange={(p) => fetchPreview('bank', p)}
                issues={data?.issues || []}
                focusedRowIndex={focusedRow?.type === 'bank' ? focusedRow.index : null}
              />
            </div>
          </div>
        );

      case 'resilience':
        if (!data) return <Placeholder title="Monte Carlo Resilience" />;
        return <MonteCarloPlot data={data.forensic?.monte_carlo} />;
      case 'memo':
        if (!data) return <Placeholder title="AI Audit Sidekick" />;
        return <AuditMemoAssistant summary={data.summary} issues={data.issues} />;

      case 'explain':
        if (!data) return <Placeholder title="Explainable Risk Insights" icon={Search} />;
        return <RiskExplainer riskScores={data.risk_scores} />;

      case 'bank-comparison':
        if (!data) return <Placeholder title="Bank Statement Reconciliation" icon={FileText} />;
        return <BankReconView reconciliationList={data.reconciliation_list} />;

      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0c10]">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 py-12 px-8 overflow-y-auto custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-12">

          {/* Header Section */}
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent capitalize">
              {activeTab === 'overview' ? 'Forensic Analytics Hub' : `${activeTab} Intelligence`}
            </h1>
            <p className="text-gray-500 text-sm font-medium">Session: Air-Gapped Local Audit Engagement</p>
          </div>

          {/* Evidence Ingestion Card */}
          <div className="bg-[#11141b]/30 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-2 flex-1">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Database className="w-5 h-5 mr-3 text-indigo-400" />
                  Evidence Ingestion
                </h2>
                <p className="text-xs text-gray-500 font-medium max-w-sm">
                  Load your primary ledger and bank statement evidence for deep relational scan. Files remain local.
                </p>
              </div>
              <div className="w-full md:w-3/4">
                <UploadSection
                  setData={setData}
                  setLoading={setLoading}
                  setError={setError}
                />
              </div>
            </div>
          </div>

          {/* Status Indicators */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
              <p className="text-gray-400 animate-pulse font-medium">LedgerSpy is analyzing deep financial patterns...</p>
            </div>
          )}

          {error && (
            <div className="flex items-center space-x-3 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Dynamic Content Rendering */}
          {!loading && renderContent()}

        </div>
      </div>
    </div>
  );
};

export default Dashboard;

