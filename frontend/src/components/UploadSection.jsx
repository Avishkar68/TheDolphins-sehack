import React, { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

const UploadSection = ({ setData, setLoading, setError }) => {
  const [ledgerFile, setLedgerFile] = useState(null);
  const [bankFile, setBankFile] = useState(null);

  const handleUpload = async () => {
    if (!ledgerFile || !bankFile) {
      setError("Please select both Ledger and Bank CSV files.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('ledger', ledgerFile);
    formData.append('bank', bankFile);
    // Optional: Add contamination parameter if needed
    // formData.append('contamination', 0.05);

    try {
      // Backend is on port 4000
      const response = await axios.post('http://localhost:4000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setData(response.data);
      } else {
        setError(response.data.message || "Failed to analyze data.");
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Server connection failed. Ensure both backend and AI services are running.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const FileInput = ({ label, file, setFile }) => (
    <div className="flex-1">
      <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
      <div className={`relative group cursor-pointer border-2 border-dashed ${file ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-gray-800 hover:border-gray-700'} rounded-2xl p-6 transition-all`}>
        <input
          type="file"
          accept=".csv,.xlsx"
          onChange={(e) => setFile(e.target.files[0])}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-xl ${file ? 'bg-indigo-500/20 text-indigo-400' : 'bg-gray-900 text-gray-500'} transition-colors`}>
            {file ? <CheckCircle2 className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium truncate ${file ? 'text-gray-200' : 'text-gray-500'}`}>
              {file ? file.name : `Select ${label}...`}
            </p>
            <p className="text-xs text-gray-600 mt-0.5">CSV or Excel files preferred</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-6">
        <FileInput 
          label="Ledger Records" 
          file={ledgerFile} 
          setFile={setLedgerFile} 
        />
        <FileInput 
          label="Bank Statement" 
          file={bankFile} 
          setFile={setBankFile} 
        />
      </div>

      <div className="flex justify-center pt-4">
        <button
          onClick={handleUpload}
          className="relative group px-12 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold tracking-wide transition-all shadow-xl shadow-indigo-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
          disabled={!ledgerFile || !bankFile}
        >
          <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:animate-shine" />
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5" />
            <span>Process Intelligence Analysis</span>
          </div>
        </button>
      </div>

      {/* Quick Tips */}
      <div className="flex items-center justify-center space-x-6 text-xs text-gray-600">
        <span className="flex items-center"><CheckCircle2 className="w-3 h-3 mr-1.5 text-indigo-500/50" /> Secure Transit</span>
        <span className="flex items-center"><CheckCircle2 className="w-3 h-3 mr-1.5 text-indigo-500/50" /> ML Pattern Scan</span>
        <span className="flex items-center"><CheckCircle2 className="w-3 h-3 mr-1.5 text-indigo-500/50" /> 100% Client-Side Ingestion</span>
      </div>
    </div>
  );
};

export default UploadSection;
