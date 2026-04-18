import React, { useState } from 'react';
import axios from 'axios';
import {
  MessageSquare,
  Sparkles,
  Copy,
  Check,
  RefreshCcw,
  FileText,
  ShieldCheck,
  Send
} from 'lucide-react';

const AuditMemoAssistant = ({ summary, issues }) => {
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [displayText, setDisplayText] = useState('');

  const simulateTyping = (text) => {
    let index = 0;
    setDisplayText('');
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayText((prev) => prev + text.charAt(index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 15); // Fast typing
  };

  const generateMemo = async () => {
    setLoading(true);
    setDisplayText('');
    try {
      const resp = await axios.post('http://localhost:4000/api/upload/generate-memo', {
        summary,
        issues: issues ? issues.slice(0, 20) : [] // Optimization: Only send top 20 issues for synthesis
      }, { timeout: 120000 }); // 120s timeout in browser
      if (resp.data.success) {
        setMemo(resp.data.memo);
        simulateTyping(resp.data.memo);
      } else {
        throw new Error(resp.data.error || 'Failed to synthesize memo.');
      }
    } catch (err) {
      console.error('Failed to generate memo:', err);
      setMemo(`[ERROR] Avishkar is currently unreachable. \n\nReason: ${err.message}\n\nTroubleshooting:\n1. Ensure Ollama is running (ollama serve)\n2. Verify the model is pulled (ollama pull phi3)\n3. Check if the AI Service (Port 8000) is active.`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(memo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-white flex items-center">
            <MessageSquare className="w-5 h-5 mr-3 text-indigo-400" />
            Audit Sidekick (Avishkar)
          </h3>
          <p className="text-xs text-gray-500 font-medium">Auto-drafting forensic memos in professional accounting tone using Llama 3.1 8B</p>
        </div>

        <button
          onClick={generateMemo}
          disabled={loading}
          className="flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
        >
          {loading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>{memo ? 'Re-draft Memo' : 'Generate Forensic Memo'}</span>
        </button>
      </div>

      {!memo && !loading && (
        <div className="bg-[#11141b]/30 border-2 border-dashed border-white/5 rounded-3xl p-16 flex flex-col items-center justify-center space-y-4">
          <div className="p-4 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            <FileText className="w-10 h-10 text-indigo-400 opacity-50" />
          </div>
          <p className="text-gray-500 font-medium text-center max-w-sm leading-relaxed">
            Click generate to have LedgerSpy's AI Sidekick synthesize your findings into a standard audit report.
          </p>
        </div>
      )}

      {loading && (
        <div className="bg-[#11141b]/30 border border-white/5 rounded-3xl p-16 flex flex-col items-center justify-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-indigo-500/10 border-t-indigo-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <p className="text-white font-bold tracking-tight">Avishkar is reviewing the evidence...</p>
            <p className="text-gray-500 text-xs font-medium">Applying professional accounting standards & skepticism</p>
          </div>
        </div>
      )}

      {memo && !loading && (
        <div className="grid grid-cols-3 gap-8 items-start">
          {/* Memo Text Area */}
          <div className="col-span-2 bg-[#11141b]/50 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Draft Status: Forensic Ready</span>
              </div>
              <button
                onClick={copyToClipboard}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 transition-all flex items-center space-x-2 px-3"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span className="text-[10px] font-bold uppercase tracking-widest">{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>
            <div className="p-10 bg-white/[0.01] relative">
              {/* Watermark/Logo */}
              <div className="absolute top-10 right-10 opacity-5 select-none pointer-events-none">
                <ShieldCheck className="w-32 h-32 text-white" />
              </div>

              <div className="space-y-8 relative z-10">
                {/* Informal Letterhead */}
                <div className="border-b border-indigo-500/10 pb-6 mb-8">
                  <h2 className="text-sm font-black text-indigo-400 uppercase tracking-[0.3em]">Confidential Forensic Memorandum</h2>
                  <p className="text-[10px] text-gray-600 mt-1 uppercase font-bold tracking-widest">Case Ref: {new Date().getFullYear()}-LS-{Math.floor(1000 + Math.random() * 9000)}</p>
                </div>

                <pre className="text-sm font-medium text-gray-300 whitespace-pre-wrap leading-relaxed font-sans min-h-[400px]">
                  {displayText || (memo ? memo : "Awaiting forensic synthesis...")}
                </pre>

                <div className="pt-12 border-t border-white/5 opacity-50">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Authored by LedgerSpy AI (Avishkar) • Local Node verified</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Context */}
          <div className="space-y-6">
            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl space-y-4">
              <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-2" />
                Audit Persona
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed font-medium">
                The Sidekick uses a predefined prompt injection to mimic a Junior Forensic Auditor (Avishkar). It prioritizes skepticism and materiality and uses Llama 3.1 8B's internal knowledge of accounting standards (IFRS/GAAP).
              </p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl space-y-4 opacity-60">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center">
                <Send className="w-3.5 h-3.5 mr-2" />
                Export Formats
              </h4>
              <div className="space-y-2">
                <ExportButton label="PDF Formal Report" />
                <ExportButton label="XLSX Supporting Data" />
                <ExportButton label="JSON Audit Trail" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ExportButton = ({ label }) => (
  <button className="w-full text-left px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all">
    {label}
  </button>
);

export default AuditMemoAssistant;
