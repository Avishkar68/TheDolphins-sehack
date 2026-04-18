import React, { useEffect, useRef } from 'react';
import { 
  Database, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle,
  MapPin
} from 'lucide-react';

const PreviewTable = ({ 
  type, 
  data, 
  pagination, 
  onPageChange, 
  issues, 
  focusedRowIndex,
  onRowClick
}) => {
  const tableRef = useRef(null);
  const rowRefs = useRef({});

  // Auto-scroll to focused row
  useEffect(() => {
    if (focusedRowIndex && rowRefs.current[focusedRowIndex]) {
      rowRefs.current[focusedRowIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [focusedRowIndex, data]);

  if (!data || data.length === 0) return null;

  // Find issues related to this table
  const relevantIssues = issues.filter(iss => iss.source === type);

  return (
    <div className="overflow-hidden flex flex-col h-[600px] transition-all duration-500 w-full">
      {/* Table Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <h3 className="text-lg font-bold text-white flex items-center capitalize">
          <Database className="w-5 h-5 mr-3 text-indigo-400" />
          {type} Source Explorer
        </h3>
        
        {/* Pagination Controls */}
        <div className="flex items-center space-x-4">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Page {pagination.page} of {pagination.total_pages}
          </span>
          <div className="flex bg-black/20 rounded-xl p-1 border border-white/5">
            <button 
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 disabled:opacity-20 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              disabled={pagination.page >= pagination.total_pages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 disabled:opacity-20 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto custom-scrollbar" ref={tableRef}>
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="sticky top-0 z-10 bg-[#161a22] shadow-xl">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest w-20">Idx</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest w-30">Status</th>
              {Object.keys(data[0] || {}).filter(k => k !== 'row_index').map(key => (
                <th key={key} className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  {key.replace('_', ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {data.map((row) => {
              const hasIssue = relevantIssues.some(iss => iss.row_index === row.row_index);
              const isFocused = focusedRowIndex === row.row_index;
              const issue = relevantIssues.find(iss => iss.row_index === row.row_index);

              return (
                <tr 
                  key={row.row_index}
                  ref={el => rowRefs.current[row.row_index] = el}
                  onClick={() => onRowClick && onRowClick(type, row.row_index)}
                  title="Click to open this row in original spreadsheet"
                  className={`group transition-all duration-300 cursor-pointer ${
                    isFocused 
                      ? 'bg-indigo-500/10 ring-2 ring-indigo-500/50 z-20 relative shadow-[0_0_30px_rgba(99,102,241,0.2)]' 
                      : hasIssue 
                        ? 'hover:bg-amber-500/[0.05] bg-amber-500/[0.02]' 
                        : 'hover:bg-white/[0.05]'
                  }`}
                >
                  <td className="px-6 py-4">
                    <span className={`text-xs font-mono font-bold ${isFocused ? 'text-indigo-400' : 'text-gray-600'}`}>
                      #{row.row_index}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {hasIssue && (
                      <div className={`flex items-center space-x-1.5 px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                        issue.severity === 'high' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}>
                        <AlertTriangle className="w-3 h-3" />
                        <span>{issue.issue_type}</span>
                      </div>
                    )}
                    {isFocused && (
                      <div className="flex items-center space-x-1 px-2 py-1 rounded-md bg-indigo-500 text-white text-[9px] font-bold uppercase tracking-widest mt-1">
                        <MapPin className="w-2.5 h-2.5" />
                        <span>Focus</span>
                      </div>
                    )}
                  </td>
                  {Object.entries(row).filter(([k]) => k !== 'row_index').map(([key, value]) => (
                    <td key={key} className="px-6 py-4">
                      <span className={`text-xs font-medium transition-colors ${
                        isFocused ? 'text-white' : hasIssue && issue.field === key ? 'text-red-400 font-bold' : 'text-gray-400'
                      }`}>
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </span>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty State Shadow */}
      <div className="p-4 bg-white/[0.01] border-t border-white/5 text-center">
        <p className="text-[10px] font-bold text-gray-700 uppercase tracking-widest">
           Analyzing Row-to-Row Integrity 
        </p>
      </div>
    </div>
  );
};

export default PreviewTable;
