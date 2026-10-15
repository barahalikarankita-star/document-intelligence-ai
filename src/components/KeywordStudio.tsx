import React, { useState, useMemo } from 'react';
import { 
  Tag, 
  Download, 
  Search, 
  Filter, 
  BarChart2, 
  Database,
  FileSpreadsheet,
  Check
} from 'lucide-react';
import { DocumentChunk, KeywordItem } from '../types';
import { extractKeywordsFromChunks } from '../utils/nlpEngine';

interface KeywordStudioProps {
  chunks: DocumentChunk[];
}

export const KeywordStudio: React.FC<KeywordStudioProps> = ({ chunks }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Compute keywords using NLP TF-IDF and category heuristics
  const allKeywords = useMemo(() => {
    return extractKeywordsFromChunks(chunks, 40);
  }, [chunks]);

  const categories = ['All', 'Concept', 'Methodology', 'Metric', 'Architecture', 'Entity'];

  const filteredKeywords = useMemo(() => {
    return allKeywords.filter(k => {
      const matchesSearch = k.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        k.contextSnippet.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = selectedCategory === 'All' || k.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [allKeywords, searchTerm, selectedCategory]);

  const handleExportCSV = () => {
    if (filteredKeywords.length === 0) return;

    const headers = ['Rank', 'Keyword', 'Category', 'TF_IDF_Score', 'Corpus_Frequency', 'Sample_Context'];
    const rows = filteredKeywords.map((k, idx) => [
      idx + 1,
      `"${k.word}"`,
      `"${k.category}"`,
      k.score,
      k.frequency,
      `"${k.contextSnippet.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `document_intelligence_keywords_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    setDownloadSuccess('CSV Exported');
    setTimeout(() => setDownloadSuccess(null), 2500);
  };

  const handleExportJSON = () => {
    if (filteredKeywords.length === 0) return;

    const jsonContent = JSON.stringify(filteredKeywords, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `document_intelligence_keywords_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);

    setDownloadSuccess('JSON Exported');
    setTimeout(() => setDownloadSuccess(null), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Tag className="w-5 h-5 text-indigo-400" />
              <span>NLP Keyword & Semantic Entity Extraction</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              TF-IDF (Term Frequency–Inverse Document Frequency) scoring with entity categorization and contextual grounding.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              disabled={filteredKeywords.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition disabled:opacity-40"
            >
              {downloadSuccess === 'CSV Exported' ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleExportJSON}
              disabled={filteredKeywords.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition disabled:opacity-40"
            >
              {downloadSuccess === 'JSON Exported' ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter extracted keywords or concepts..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-950 border border-slate-800 rounded-lg">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs rounded transition whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Keywords Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-mono">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Extracted Keyword</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">TF-IDF Score</th>
                <th className="py-3 px-4 text-right">Corpus Frequency</th>
                <th className="py-3 px-4">Contextual Passage Anchor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredKeywords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                    No keywords match your search query.
                  </td>
                </tr>
              ) : (
                filteredKeywords.map((item, idx) => {
                  return (
                    <tr
                      key={item.word}
                      className="hover:bg-slate-800/40 transition group"
                    >
                      <td className="py-3 px-4 text-center font-mono text-slate-500">
                        {idx + 1}
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-100">
                        {item.word}
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <span className={`text-[11px] font-medium ${
                          item.category === 'Metric' ? 'text-amber-400' :
                          item.category === 'Methodology' ? 'text-indigo-400' :
                          item.category === 'Architecture' ? 'text-cyan-400' :
                          item.category === 'Entity' ? 'text-emerald-400' : 'text-slate-300'
                        }`}>
                          {item.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono tabular-nums text-indigo-400 font-semibold">
                        {item.score}
                      </td>

                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-300">
                        {item.frequency}
                      </td>

                      <td className="py-3 px-4 text-slate-400 max-w-md truncate group-hover:whitespace-normal group-hover:break-words">
                        "{item.contextSnippet}"
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
