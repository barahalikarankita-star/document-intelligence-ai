import React, { useRef, useState } from 'react';
import { 
  FileText, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  Layers, 
  Sliders, 
  BookOpen, 
  FileUp, 
  Sparkles,
  ChevronRight,
  X
} from 'lucide-react';
import { DocumentChunk, DocumentMetadata, ProcessingStatus } from '../types';

interface DocumentManagerProps {
  documents: DocumentMetadata[];
  chunks: DocumentChunk[];
  selectedDocId: string | null;
  onSelectDoc: (id: string | null) => void;
  onUploadFiles: (files: FileList | File[]) => void;
  onLoadSamples: () => void;
  onDeleteDocument: (id: string) => void;
  processingStatus: ProcessingStatus;
  statusMessage: string;
  chunkSize: number;
  chunkOverlap: number;
  onUpdateChunkSettings: (size: number, overlap: number) => void;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({
  documents,
  chunks,
  selectedDocId,
  onSelectDoc,
  onUploadFiles,
  onLoadSamples,
  onDeleteDocument,
  processingStatus,
  statusMessage,
  chunkSize,
  chunkOverlap,
  onUpdateChunkSettings,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [inspectingChunkDoc, setInspectingChunkDoc] = useState<DocumentMetadata | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUploadFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUploadFiles(e.target.files);
    }
  };

  const selectedDocChunks = inspectingChunkDoc
    ? chunks.filter(c => c.docId === inspectingChunkDoc.id)
    : [];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>Document Repository & Chunk Preprocessing</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            NLP ingestion pipeline preserving page coordinates, sliding-window chunk overlap, and vector indexing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onLoadSamples}
            disabled={processingStatus !== 'idle' && processingStatus !== 'indexed'}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-indigo-300 bg-indigo-950/60 border border-indigo-700/50 rounded-lg hover:bg-indigo-900/60 transition disabled:opacity-50"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Load Diploma Sample Papers</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={processingStatus !== 'idle' && processingStatus !== 'indexed'}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition disabled:opacity-50"
          >
            <FileUp className="w-3.5 h-3.5" />
            <span>Browse PDF / TXT</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.txt,.md,.json"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* Processing Banner */}
      {processingStatus !== 'idle' && processingStatus !== 'indexed' && (
        <div className="mt-4 p-3 bg-indigo-950/40 border border-indigo-800/40 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-indigo-200 font-medium">{statusMessage}</span>
          </div>
          <span className="text-xs text-indigo-400 font-mono">Stage: {processingStatus}</span>
        </div>
      )}

      {/* Upload Drag Target */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`mt-4 border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
          isDragOver 
            ? 'border-indigo-500 bg-indigo-950/30' 
            : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
        }`}
      >
        <FileUp className="w-8 h-8 text-slate-500 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-200">
          Drop PDF files here or <span className="text-indigo-400 underline">browse</span>
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Supports multi-page PDFs, research reports, clinical charts, and technical documentation
        </p>
      </div>

      {/* Chunking Settings bar */}
      <div className="mt-4 p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Sliders className="w-4 h-4 text-indigo-400" />
          <span className="font-medium text-slate-300">Chunking Hyperparameters:</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Chunk Size:</span>
            <select
              value={chunkSize}
              onChange={(e) => onUpdateChunkSettings(Number(e.target.value), chunkOverlap)}
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-2 py-1 focus:outline-none focus:border-indigo-500 font-mono"
            >
              <option value={100}>100 words (Fine-grained)</option>
              <option value={150}>150 words (Standard)</option>
              <option value={250}>250 words (Balanced)</option>
              <option value={400}>400 words (Coarse context)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Window Overlap:</span>
            <select
              value={chunkOverlap}
              onChange={(e) => onUpdateChunkSettings(chunkSize, Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-2 py-1 focus:outline-none focus:border-indigo-500 font-mono"
            >
              <option value={15}>15 words (10%)</option>
              <option value={30}>30 words (20%)</option>
              <option value={50}>50 words (33%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Document List */}
      <div className="mt-5 space-y-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1 mb-2">
          Indexed Documents ({documents.length})
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm border border-slate-800/60 rounded-lg bg-slate-950/30">
            No documents indexed. Click "Load Diploma Sample Papers" above to initialize with educational benchmarks.
          </div>
        ) : (
          documents.map(doc => {
            const docChunksCount = chunks.filter(c => c.docId === doc.id).length;
            const isSelected = selectedDocId === doc.id;

            return (
              <div
                key={doc.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition ${
                  isSelected
                    ? 'bg-slate-800/80 border-indigo-500/50 shadow-sm'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div 
                  className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 pr-4"
                  onClick={() => onSelectDoc(isSelected ? null : doc.id)}
                >
                  <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-indigo-400 shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-200 truncate">
                      {doc.name}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-mono mt-0.5">
                      <span>{doc.pageCount} {doc.pageCount === 1 ? 'page' : 'pages'}</span>
                      <span>·</span>
                      <span>{docChunksCount} chunks</span>
                      <span>·</span>
                      <span>{(doc.size / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setInspectingChunkDoc(doc)}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded transition"
                    title="Inspect Chunks"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Chunks</span>
                  </button>

                  <button
                    onClick={() => onDeleteDocument(doc.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded transition"
                    title="Remove Document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Chunk Inspector Modal */}
      {inspectingChunkDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span>Chunk Inspector: {inspectingChunkDoc.name}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Total Chunks: {selectedDocChunks.length} · Average Size: {chunkSize} words · Overlap: {chunkOverlap} words
                </p>
              </div>
              <button
                onClick={() => setInspectingChunkDoc(null)}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {selectedDocChunks.map((chunk, idx) => (
                <div key={chunk.id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg">
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-2 mb-2 border-b border-slate-800/80 font-mono">
                    <span className="text-indigo-400 font-semibold">Chunk #{idx + 1} (Index {chunk.chunkIndex})</span>
                    <span>Page {chunk.pageNumber}</span>
                    <span>{chunk.tokenCount} tokens (~{chunk.text.split(/\s+/).length} words)</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {chunk.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-slate-800 text-right bg-slate-950/40">
              <button
                onClick={() => setInspectingChunkDoc(null)}
                className="px-4 py-1.5 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-md"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
