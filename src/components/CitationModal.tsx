import React from 'react';
import { BookMarked, X, Copy, Check, FileText } from 'lucide-react';
import { CitationReference } from '../types';

interface CitationModalProps {
  citation: CitationReference | null;
  onClose: () => void;
}

export const CitationModal: React.FC<CitationModalProps> = ({ citation, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!citation) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(citation.snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-700/50 flex items-center justify-center text-indigo-400">
              <BookMarked className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Supporting Source Reference
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {citation.docName} · Page {citation.pageNumber} · Chunk #{citation.chunkIndex + 1}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Vector Proximity Match:</span>
            <span className="px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-semibold border border-emerald-800/50">
              {Math.round(citation.score * 100)}% Cosine Similarity
            </span>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-slate-200 leading-relaxed max-h-64 overflow-y-auto font-sans">
            "{citation.snippet}"
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg text-xs text-slate-400 leading-relaxed font-sans">
            <span className="text-indigo-400 font-semibold">Educational Note: </span>
            This exact text chunk was retrieved from ChromaDB's HNSW vector index and injected into the Gemini context prompt to verify the response.
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-md transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Passage'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition"
          >
            Close Citation
          </button>
        </div>
      </div>
    </div>
  );
};
