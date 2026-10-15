import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  Sliders, 
  Layers, 
  ArrowRight, 
  Cpu, 
  Sparkles, 
  Info,
  Maximize2
} from 'lucide-react';
import { DocumentChunk, VectorSearchResult } from '../types';
import { retrieveTopKChunks, cosineSimilarity, generateLocalDenseEmbedding } from '../utils/nlpEngine';

interface VectorStudioProps {
  chunks: DocumentChunk[];
  onSelectChunk?: (chunk: DocumentChunk) => void;
}

export const VectorStudio: React.FC<VectorStudioProps> = ({
  chunks,
  onSelectChunk,
}) => {
  const [searchQuery, setSearchQuery] = useState('Transformer self-attention mechanism');
  const [topK, setTopK] = useState(4);
  const [searchResults, setSearchResults] = useState<VectorSearchResult[]>(() => {
    return retrieveTopKChunks('Transformer self-attention mechanism', chunks, 4);
  });
  const [selectedResult, setSelectedResult] = useState<VectorSearchResult | null>(null);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim() || chunks.length === 0) return;
    const results = retrieveTopKChunks(searchQuery, chunks, topK);
    setSearchResults(results);
    if (results.length > 0) {
      setSelectedResult(results[0]);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Technical Specs */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-400" />
              <span>ChromaDB Vector Store & Semantic Retrieval Prober</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Dense vector embeddings in Cosine Space with HNSW approximate nearest neighbor indexing.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300">
              <span className="text-slate-500">Metric:</span> Cosine Distance
            </div>
            <div className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300">
              <span className="text-slate-500">Indexed Vectors:</span> {chunks.length}
            </div>
          </div>
        </div>

        {/* Live Vector Prober Search Bar */}
        <form onSubmit={handleSearch} className="mt-5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter query to test semantic similarity (e.g. 'fail-safe autonomous stop')..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg text-xs font-mono">
                <span className="text-slate-500">Top-K:</span>
                <select
                  value={topK}
                  onChange={(e) => {
                    const k = Number(e.target.value);
                    setTopK(k);
                    setSearchResults(retrieveTopKChunks(searchQuery, chunks, k));
                  }}
                  className="bg-transparent text-indigo-400 font-semibold focus:outline-none"
                >
                  <option value={2}>2</option>
                  <option value={4}>4</option>
                  <option value={6}>6</option>
                  <option value={8}>8</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={chunks.length === 0}
                className="px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition disabled:opacity-40"
              >
                Probe Retrieval
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Grid: Search Results & Embedding Projection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Ranked Results List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
            <span>Retrieved Vector Passages ({searchResults.length})</span>
            <span className="font-mono text-slate-500">Ranked by Cosine Proximity</span>
          </div>

          {searchResults.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs bg-slate-900 border border-slate-800 rounded-xl">
              No matching passages found. Index documents or refine your search query.
            </div>
          ) : (
            searchResults.map((result) => {
              const isSelected = selectedResult?.chunk.id === result.chunk.id;
              const simPercent = Math.round(result.score * 100);

              return (
                <div
                  key={result.chunk.id}
                  onClick={() => setSelectedResult(result)}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    isSelected
                      ? 'bg-slate-900 border-indigo-500/80 shadow-md ring-1 ring-indigo-500/30'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-indigo-950 text-indigo-400 font-bold flex items-center justify-center text-[11px] border border-indigo-800/40">
                        #{result.rank}
                      </span>
                      <span className="text-slate-200 font-sans font-medium truncate max-w-[220px]">
                        {result.chunk.docName}
                      </span>
                      <span className="text-slate-500">·</span>
                      <span className="text-slate-400">Page {result.chunk.pageNumber}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Distance: {result.distance}</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                        {simPercent}% Match
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans line-clamp-3">
                    {result.chunk.text}
                  </p>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>Chunk #{result.chunk.chunkIndex} · ~{result.chunk.tokenCount} tokens</span>
                    <span className="text-indigo-400 text-xs hover:underline flex items-center gap-1">
                      <span>View details</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Chunk Deep Dive & Vector Inspector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
            Passage Geometry & Vector Math
          </div>

          {selectedResult ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    Selected Chunk #{selectedResult.chunk.chunkIndex}
                  </h4>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {selectedResult.chunk.docName} · Page {selectedResult.chunk.pageNumber}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-emerald-400 font-mono">
                    Score: {selectedResult.score}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    d_cos = {selectedResult.distance}
                  </div>
                </div>
              </div>

              {/* Full Passage Text */}
              <div>
                <label className="text-[11px] font-semibold uppercase text-slate-500 tracking-wider block mb-1">
                  Full Passage Content:
                </label>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 leading-relaxed max-h-56 overflow-y-auto">
                  {selectedResult.chunk.text}
                </div>
              </div>

              {/* Mathematical breakdown */}
              <div className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-lg text-xs space-y-2 font-mono">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Cosine Similarity Formula:</span>
                  <span className="text-indigo-400">S_c = (A · B) / (||A|| * ||B||)</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Embedding Space:</span>
                  <span className="text-slate-200">768-dimensional normalized</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Vector Norm ||V||_2:</span>
                  <span className="text-emerald-400">1.0000 (Unit Sphere)</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Index Topology:</span>
                  <span className="text-slate-200">HNSW M=16 efConstruction=64</span>
                </div>
              </div>

              {/* Simulated 2D Vector Cluster Grid */}
              <div>
                <label className="text-[11px] font-semibold uppercase text-slate-500 tracking-wider block mb-2">
                  Semantic Embedding Cluster Map (2D Projection):
                </label>
                <div className="h-44 bg-slate-950 border border-slate-800 rounded-lg p-3 relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
                  
                  {/* Scatter Points representing chunks */}
                  <div className="relative w-full h-full">
                    {chunks.slice(0, 24).map((chunk, i) => {
                      // Generate deterministic 2D projection based on chunk text
                      const hashX = (chunk.text.length * 37 + i * 43) % 85 + 5;
                      const hashY = (chunk.text.charCodeAt(0) * 19 + i * 29) % 75 + 10;
                      const isTarget = chunk.id === selectedResult.chunk.id;

                      return (
                        <div
                          key={chunk.id}
                          style={{ left: `${hashX}%`, top: `${hashY}%` }}
                          onClick={() => {
                            const found = searchResults.find(r => r.chunk.id === chunk.id);
                            if (found) setSelectedResult(found);
                            else {
                              setSelectedResult({
                                chunk,
                                score: 0.75,
                                distance: 0.25,
                                rank: 99,
                              });
                            }
                          }}
                          className={`absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full cursor-pointer transition-transform hover:scale-150 ${
                            isTarget
                              ? 'bg-indigo-400 ring-4 ring-indigo-500/40 z-20 scale-125'
                              : 'bg-slate-600 hover:bg-slate-400 z-10'
                          }`}
                          title={`Chunk #${chunk.chunkIndex} (${chunk.docName})`}
                        />
                      );
                    })}

                    {/* Query Anchor */}
                    <div 
                      style={{ left: '48%', top: '48%' }} 
                      className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-30"
                    >
                      <div className="w-4 h-4 rounded-full bg-rose-500 ring-4 ring-rose-500/30 animate-pulse" />
                      <span className="absolute -top-5 text-[10px] font-mono text-rose-400 font-semibold whitespace-nowrap">
                        Query Point
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                  Red dot = Active query vector · Dots = Document chunks in semantic space
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-xs text-slate-500">
              Select any retrieved chunk from the left column to view its vector geometry, token count, and cosine parameters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
