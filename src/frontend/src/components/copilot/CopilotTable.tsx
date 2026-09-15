import React from 'react';

interface CopilotTableProps {
  title?: string;
  columns: string[];
  rows: (string | number)[][];
}

export const CopilotTable: React.FC<CopilotTableProps> = ({ title, columns, rows }) => {
  if (!columns || columns.length === 0 || !rows || rows.length === 0) {
    return null;
  }

  // Determine if a column is primarily numeric (to right-align it)
  const isNumericColumn = (colIdx: number) => {
    return rows.every(row => {
      const val = row[colIdx];
      if (val === undefined || val === null || val === '') return true;
      const str = String(val).trim();
      return /^-?\d+(\.\d+)?%?$|^[$€£]-?\d+/.test(str);
    });
  };

  return (
    <div className="my-2.5 w-full bg-surface border border-border-subtle rounded-lg overflow-hidden shadow-xs">
      {title && (
        <div className="px-3 py-2 bg-surface-subtle/80 border-b border-border-subtle flex items-center justify-between">
          <span className="text-[11px] font-semibold text-text-main uppercase tracking-wider">
            {title}
          </span>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-surface-subtle border-b border-border-subtle text-[11px] font-semibold text-text-muted">
              {columns.map((col, idx) => {
                const numeric = isNumericColumn(idx);
                return (
                  <th
                    key={idx}
                    className={`px-3 py-2 font-medium tracking-tight whitespace-nowrap ${
                      numeric ? 'text-right' : 'text-left'
                    }`}
                  >
                    {col}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle bg-surface">
            {rows.map((row, rIdx) => (
              <tr
                key={rIdx}
                className="hover:bg-slate-50/70 transition-colors"
              >
                {row.map((cell, cIdx) => {
                  const numeric = isNumericColumn(cIdx);
                  const str = String(cell ?? '');
                  const isHighRisk = str.toUpperCase() === 'HIGH' || str.toUpperCase() === 'CRITICAL';
                  const isLowRisk = str.toUpperCase() === 'LOW';
                  const isMedRisk = str.toUpperCase() === 'MEDIUM';

                  return (
                    <td
                      key={cIdx}
                      className={`px-3 py-1.5 text-xs text-text-main whitespace-nowrap ${
                        numeric ? 'text-right font-medium' : 'text-left'
                      }`}
                    >
                      {isHighRisk ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          {str}
                        </span>
                      ) : isLowRisk ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {str}
                        </span>
                      ) : isMedRisk ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          {str}
                        </span>
                      ) : (
                        str
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
