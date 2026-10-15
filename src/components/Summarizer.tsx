import React, { useState } from 'react';
import { 
  Sparkles, 
  FileText, 
  Copy, 
  Check, 
  Download, 
  Layers, 
  BookOpen, 
  ListOrdered,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { DocumentChunk, DocumentMetadata, SummaryResult } from '../types';

interface SummarizerProps {
  documents: DocumentMetadata[];
  chunks: DocumentChunk[];
}

export const Summarizer: React.FC<SummarizerProps> = ({ documents, chunks }) => {
  const [selectedDocId, setSelectedDocId] = useState<string>(
    documents[0]?.id || 'all'
  );
  const [summaryType, setSummaryType] = useState<SummaryResult['summaryType']>('executive');
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<SummaryResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const targetDoc = documents.find(d => d.id === selectedDocId);
      const docName = targetDoc ? targetDoc.name : 'All Indexed Documents (Corpus)';
      
      const relevantChunks = selectedDocId === 'all'
        ? chunks
        : chunks.filter(c => c.docId === selectedDocId);

      const content = relevantChunks.map(c => c.text).join('\n\n');

      if (!content.trim()) {
        setErrorMessage('No content found for the selected document.');
        setIsLoading(false);
        return;
      }

      const res = await fetch('/api/documents/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docName,
          content,
          summaryType,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      setSummary(data);
    } catch (err: any) {
      console.error('Summary error:', err);
      setErrorMessage(err.message || 'Failed to synthesize summary.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!summary) return;
    const textToCopy = `
# ${summary.title}
Document: ${summary.docName}
Generated: ${new Date(summary.generatedAt).toLocaleString()}

## Executive Summary
${summary.executiveSummary}

## Key Highlights
${summary.keyHighlights.map(h => `- ${h}`).join('\n')}

## Section Breakdowns
${summary.sectionBreakdowns.map(s => `### ${s.title}\n${s.content}`).join('\n\n')}
    `.trim();

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!summary) return;
    const content = `
# ${summary.title}
Document: ${summary.docName}
Generated: ${new Date(summary.generatedAt).toLocaleString()}

## Executive Summary
${summary.executiveSummary}

## Key Highlights
${summary.keyHighlights.map(h => `- ${h}`).join('\n')}

## Section Breakdowns
${summary.sectionBreakdowns.map(s => `### ${s.title}\n${s.content}`).join('\n\n')}
    `.trim();

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${summary.docName.replace(/\.[^/.]+$/, '')}_Summary.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Control Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>Document Summarization Engine</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Multi-tiered document abstraction synthesizing key methodologies, empirical findings, and actionable conclusions.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-12 gap-4">
          {/* Target Document Selector */}
          <div className="sm:col-span-6">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
              Select Document Source:
            </label>
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Entire Document Corpus (All Files)</option>
              {documents.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.pageCount} pgs, {d.chunkCount} chunks)
                </option>
              ))}
            </select>
          </div>

          {/* Format Selector */}
          <div className="sm:col-span-4">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
              Summary Mode:
            </label>
            <select
              value={summaryType}
              onChange={(e) => setSummaryType(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="executive">Executive Brief (Narrative & Strategy)</option>
              <option value="bullets">Key Findings (Bulleted Takeaways)</option>
              <option value="section-by-section">Section-by-Section Deep Dive</option>
              <option value="key-findings">Technical & Algorithmic Audit</option>
            </select>
          </div>

          {/* Action Button */}
          <div className="sm:col-span-2 flex items-end">
            <button
              onClick={handleGenerateSummary}
              disabled={isLoading || documents.length === 0}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Synthesize</span>
                </>
              )}
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 bg-rose-950/40 border border-rose-800/40 rounded-lg text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Summary Output Area */}
      {summary ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          
          {/* Header Bar */}
          <div className="p-5 border-b border-slate-800 bg-slate-950/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider block">
                Synthesized Document Report
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                {summary.title}
              </h3>
              <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-1">
                <span>Source: {summary.docName}</span>
                <span>·</span>
                <span>{new Date(summary.generatedAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .MD</span>
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Executive Narrative */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Executive Synthesis
              </h4>
              <p className="text-sm text-slate-200 leading-relaxed font-sans bg-slate-950/50 p-4 rounded-lg border border-slate-800/80">
                {summary.executiveSummary}
              </p>
            </div>

            {/* Key Highlights */}
            {summary.keyHighlights && summary.keyHighlights.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <ListOrdered className="w-4 h-4 text-indigo-400" />
                  <span>Key Analytical Takeaways</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {summary.keyHighlights.map((highlight, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 leading-relaxed flex items-start gap-2.5"
                    >
                      <span className="w-5 h-5 rounded bg-indigo-950 text-indigo-400 font-bold flex items-center justify-center text-[10px] shrink-0 font-mono border border-indigo-800/40">
                        {idx + 1}
                      </span>
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section Breakdowns */}
            {summary.sectionBreakdowns && summary.sectionBreakdowns.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>Section-by-Section Structural Breakdown</span>
                </h4>
                <div className="space-y-3">
                  {summary.sectionBreakdowns.map((section, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg"
                    >
                      <h5 className="text-xs font-semibold text-indigo-300 mb-1 font-mono">
                        {section.title}
                      </h5>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        {section.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500 text-xs">
          <FileText className="w-10 h-10 mx-auto text-slate-600 mb-3" />
          <p className="text-sm font-medium text-slate-300">
            No Summary Generated Yet
          </p>
          <p className="mt-1 max-w-sm mx-auto text-slate-500">
            Select a target document and summary format above, then click "Synthesize" to generate a structured AI summary.
          </p>
        </div>
      )}
    </div>
  );
};
