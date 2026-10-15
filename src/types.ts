export interface DocumentMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  pageCount: number;
  characterCount: number;
  tokenCount: number;
  uploadedAt: string;
  chunkCount: number;
  tags?: string[];
}

export interface DocumentPage {
  pageNumber: number;
  text: string;
  tokenEstimate: number;
}

export interface DocumentChunk {
  id: string;
  docId: string;
  docName: string;
  pageNumber: number;
  chunkIndex: number;
  text: string;
  tokenCount: number;
  embedding?: number[];
  charStart?: number;
  charEnd?: number;
}

export interface VectorSearchResult {
  chunk: DocumentChunk;
  score: number; // Cosine similarity 0 to 1
  distance: number; // 1 - score (Euclidean/Cosine distance)
  rank: number;
}

export interface CitationReference {
  docId: string;
  docName: string;
  pageNumber: number;
  chunkIndex: number;
  snippet: string;
  score: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  citations?: CitationReference[];
  confidence?: 'High' | 'Moderate' | 'Limited';
  keyInsights?: string[];
  audioBase64?: string;
  audioLoading?: boolean;
}

export interface SummaryResult {
  docId: string;
  docName: string;
  summaryType: 'executive' | 'bullets' | 'section-by-section' | 'key-findings';
  title: string;
  executiveSummary: string;
  keyHighlights: string[];
  sectionBreakdowns: Array<{
    title: string;
    content: string;
    pageRange?: string;
  }>;
  methodologyOrContext?: string;
  generatedAt: string;
}

export interface KeywordItem {
  word: string;
  score: number;
  frequency: number;
  category: 'Concept' | 'Methodology' | 'Metric' | 'Architecture' | 'Entity';
  contextSnippet: string;
}

export interface PipelineStats {
  totalDocuments: number;
  totalPages: number;
  totalChunks: number;
  totalTokens: number;
  vocabularySize: number;
  averageChunkLength: number;
  embeddingDimension: number;
  vectorIndexType: string;
}

export type ProcessingStatus = 'idle' | 'extracting' | 'preprocessing' | 'chunking' | 'embedding' | 'indexed' | 'error';
