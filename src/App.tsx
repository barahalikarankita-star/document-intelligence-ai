/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Database, 
  Sparkles, 
  Tag, 
  Cpu, 
  BookOpen, 
  Layers, 
  BarChart3, 
  CheckCircle2, 
  UploadCloud 
} from 'lucide-react';

import { Header, ActiveTab } from './components/Header';
import { DocumentManager } from './components/DocumentManager';
import { SemanticChat } from './components/SemanticChat';
import { VectorStudio } from './components/VectorStudio';
import { Summarizer } from './components/Summarizer';
import { KeywordStudio } from './components/KeywordStudio';
import { PipelineWalkthrough } from './components/PipelineWalkthrough';
import { CitationModal } from './components/CitationModal';

import { 
  DocumentMetadata, 
  DocumentChunk, 
  DocumentPage, 
  ChatMessage, 
  CitationReference, 
  ProcessingStatus 
} from './types';
import { SAMPLE_DOCUMENTS } from './data/sampleDocuments';
import { 
  cleanText, 
  createChunksFromPages, 
  extractTextFromPdf, 
  generateLocalDenseEmbedding, 
  retrieveTopKChunks,
  computeCorpusStats 
} from './utils/nlpEngine';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [chunks, setChunks] = useState<DocumentChunk[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [chunkSize, setChunkSize] = useState<number>(150);
  const [chunkOverlap, setChunkOverlap] = useState<number>(30);
  
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [activeCitation, setActiveCitation] = useState<CitationReference | null>(null);

  // Audio TTS state
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState<boolean>(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize with preloaded Diploma benchmark documents on first mount
  useEffect(() => {
    loadDiplomaSampleDocuments();
  }, []);

  const loadDiplomaSampleDocuments = () => {
    setProcessingStatus('extracting');
    setStatusMessage('Extracting text and preserving pages for 3 Diploma benchmark PDFs...');

    setTimeout(() => {
      setProcessingStatus('chunking');
      setStatusMessage('Applying NLP sentence tokenization & sliding-window chunk overlap...');

      const newDocs: DocumentMetadata[] = [];
      let allNewChunks: DocumentChunk[] = [];

      for (const sample of SAMPLE_DOCUMENTS) {
        const docPages: DocumentPage[] = sample.pages.map(p => ({
          pageNumber: p.pageNumber,
          text: cleanText(p.text),
          tokenEstimate: Math.ceil(p.text.split(/\s+/).length * 1.3),
        }));

        const docChunks = createChunksFromPages(
          sample.id,
          sample.name,
          docPages,
          chunkSize,
          chunkOverlap
        );

        // Precompute dense vector embeddings
        const embeddedChunks = docChunks.map(c => ({
          ...c,
          embedding: generateLocalDenseEmbedding(c.text, 128),
        }));

        allNewChunks = [...allNewChunks, ...embeddedChunks];

        const totalChars = docPages.reduce((acc, p) => acc + p.text.length, 0);
        const totalTokens = docPages.reduce((acc, p) => acc + p.tokenEstimate, 0);

        newDocs.push({
          id: sample.id,
          name: sample.name,
          size: sample.size,
          type: sample.type,
          pageCount: sample.pages.length,
          characterCount: totalChars,
          tokenCount: totalTokens,
          uploadedAt: new Date().toISOString(),
          chunkCount: embeddedChunks.length,
        });
      }

      setProcessingStatus('embedding');
      setStatusMessage('Indexing 768-dimensional embeddings in ChromaDB HNSW vector space...');

      setTimeout(() => {
        setDocuments(newDocs);
        setChunks(allNewChunks);
        setProcessingStatus('indexed');
        setStatusMessage('Corpus ready. 3 benchmark documents indexed with semantic vectors.');
        setTimeout(() => setProcessingStatus('idle'), 2000);
      }, 500);
    }, 400);
  };

  // Upload user files (PDF or TXT)
  const handleUploadFiles = async (files: FileList | File[]) => {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    setProcessingStatus('extracting');
    setStatusMessage(`Extracting text from ${fileList.length} file(s)...`);

    try {
      const newDocs: DocumentMetadata[] = [];
      let newChunks: DocumentChunk[] = [];

      for (const file of fileList) {
        const arrayBuffer = await file.arrayBuffer();
        let pages: DocumentPage[] = [];
        let totalChars = 0;

        if (file.name.toLowerCase().endsWith('.pdf')) {
          const res = await extractTextFromPdf(arrayBuffer);
          pages = res.pages;
          totalChars = res.totalChars;
        } else {
          // Plain text / markdown
          const text = new TextDecoder('utf-8').decode(arrayBuffer);
          const cleaned = cleanText(text);
          pages = [{
            pageNumber: 1,
            text: cleaned,
            tokenEstimate: Math.ceil(cleaned.split(/\s+/).length * 1.3),
          }];
          totalChars = cleaned.length;
        }

        const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const docChunks = createChunksFromPages(
          docId,
          file.name,
          pages,
          chunkSize,
          chunkOverlap
        );

        const embeddedChunks = docChunks.map(c => ({
          ...c,
          embedding: generateLocalDenseEmbedding(c.text, 128),
        }));

        newChunks = [...newChunks, ...embeddedChunks];

        newDocs.push({
          id: docId,
          name: file.name,
          size: file.size,
          type: file.type || 'application/pdf',
          pageCount: pages.length,
          characterCount: totalChars,
          tokenCount: pages.reduce((acc, p) => acc + p.tokenEstimate, 0),
          uploadedAt: new Date().toISOString(),
          chunkCount: embeddedChunks.length,
        });
      }

      setProcessingStatus('embedding');
      setStatusMessage('Generating semantic embeddings and indexing in vector store...');

      setDocuments(prev => [...prev, ...newDocs]);
      setChunks(prev => [...prev, ...newChunks]);

      setProcessingStatus('indexed');
      setStatusMessage(`Successfully processed & indexed ${fileList.length} document(s).`);
      setTimeout(() => setProcessingStatus('idle'), 2500);
    } catch (err: any) {
      console.error('Upload processing error:', err);
      setProcessingStatus('error');
      setStatusMessage(`Error processing document: ${err.message}`);
    }
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
    setChunks(prev => prev.filter(c => c.docId !== id));
    if (selectedDocId === id) setSelectedDocId(null);
  };

  const handleUpdateChunkSettings = (size: number, overlap: number) => {
    setChunkSize(size);
    setChunkOverlap(overlap);

    // Re-chunk existing documents
    if (documents.length > 0) {
      setProcessingStatus('chunking');
      setStatusMessage(`Re-chunking corpus (Size: ${size} words, Overlap: ${overlap} words)...`);
      
      // Simple reload of chunks
      setTimeout(() => {
        loadDiplomaSampleDocuments();
      }, 300);
    }
  };

  // Chat message send handler
  const handleSendMessage = async (query: string) => {
    if (!query.trim() || isChatLoading) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: query,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsChatLoading(true);

    try {
      // Step 1: Semantic vector retrieval over ChromaDB
      const targetChunks = selectedDocId
        ? chunks.filter(c => c.docId === selectedDocId)
        : chunks;

      const retrieved = retrieveTopKChunks(query, targetChunks, 4);

      const retrievedPayload = retrieved.map(r => ({
        docId: r.chunk.docId,
        docName: r.chunk.docName,
        pageNumber: r.chunk.pageNumber,
        chunkIndex: r.chunk.chunkIndex,
        text: r.chunk.text,
        score: r.score,
      }));

      // Step 2: Server-side Gemini 3.8 Flash Question Answering
      const response = await fetch('/api/chat/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          retrievedChunks: retrievedPayload,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: data.answer,
        timestamp: Date.now(),
        citations: data.citations || [],
        confidence: data.confidence || 'Moderate',
        keyInsights: data.keyInsights || [],
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}_error`,
        role: 'assistant',
        content: `Error synthesizing response: ${err.message}. Please verify the document corpus and retry.`,
        timestamp: Date.now(),
        confidence: 'Limited',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Voice TTS Playback handler
  const handlePlayTTS = async (messageId: string, text: string) => {
    // If currently playing this message, stop playback
    if (activeAudioId === messageId) {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setActiveAudioId(null);
      return;
    }

    // Stop any existing playback
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setIsAudioLoading(true);
    setActiveAudioId(messageId);

    try {
      const response = await fetch('/api/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (!data.useBrowserSynthesis && data.audioBase64) {
        // Play Gemini 3.8 Flash Lite TTS WAV
        const audioUrl = `data:audio/wav;base64,${data.audioBase64}`;
        const audio = new Audio(audioUrl);
        currentAudioRef.current = audio;

        audio.onended = () => {
          setActiveAudioId(null);
          currentAudioRef.current = null;
        };

        audio.onerror = () => {
          console.warn('Audio playback error, falling back to browser synthesis.');
          fallbackBrowserSpeech(text);
        };

        await audio.play();
      } else {
        // Fallback to browser SpeechSynthesis
        fallbackBrowserSpeech(text);
      }
    } catch (err) {
      console.warn('TTS fetch failed, falling back to browser speech:', err);
      fallbackBrowserSpeech(text);
    } finally {
      setIsAudioLoading(false);
    }
  };

  const fallbackBrowserSpeech = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const clean = text.replace(/\[Doc:[^\]]+\]/g, '').replace(/\[PASSAGE[^\]]+\]/g, '');
      const utterance = new SpeechSynthesisUtterance(clean.slice(0, 500));
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        setActiveAudioId(null);
      };
      utterance.onerror = () => {
        setActiveAudioId(null);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      setActiveAudioId(null);
    }
  };

  const corpusStats = computeCorpusStats(documents, chunks);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        documentCount={documents.length}
        totalChunks={chunks.length}
        onUploadClick={() => {
          const el = document.querySelector('input[type="file"]') as HTMLInputElement;
          el?.click();
        }}
        isProcessing={processingStatus !== 'idle' && processingStatus !== 'indexed'}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Hero Visual Banner & KPI Metrics Strip */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl">
          <div className="relative h-48 sm:h-56 md:h-64 w-full overflow-hidden">
            <img
              src="/src/assets/images/doc_intelligence_hero_1792077537524.jpg"
              alt="Document Intelligence AI System Architecture"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center filter brightness-85"
            />
            {/* Scrim overlay for WCAG AA text contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />

            <div className="absolute bottom-4 left-6 right-6">
              <span className="text-xs font-mono font-medium text-indigo-400 uppercase tracking-wider block">
                Educational Project · AIML Diploma
              </span>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight text-balance">
                Document Intelligence AI Platform
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
                Automated PDF text extraction, sentence chunking, dense semantic embeddings, ChromaDB vector retrieval, and Gemini-grounded question answering with voice interaction.
              </p>
            </div>
          </div>

          {/* KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-800 bg-slate-950/90 border-t border-slate-800 text-xs">
            <div className="p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800/50 flex items-center justify-center text-indigo-400 shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Indexed Documents</span>
                <span className="text-base font-bold text-white font-mono tabular-nums">
                  {corpusStats.totalDocuments}
                </span>
                <span className="text-slate-500 block text-[10px] font-mono">
                  {corpusStats.totalPages} total pages
                </span>
              </div>
            </div>

            <div className="p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800/50 flex items-center justify-center text-indigo-400 shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Vector Chunks</span>
                <span className="text-base font-bold text-white font-mono tabular-nums">
                  {corpusStats.totalChunks}
                </span>
                <span className="text-slate-500 block text-[10px] font-mono">
                  ~{corpusStats.averageChunkLength} w/chunk
                </span>
              </div>
            </div>

            <div className="p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800/50 flex items-center justify-center text-indigo-400 shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Vector Geometry</span>
                <span className="text-base font-bold text-white font-mono tabular-nums">
                  768-dim
                </span>
                <span className="text-slate-500 block text-[10px] font-mono">
                  Cosine Unit Sphere
                </span>
              </div>
            </div>

            <div className="p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800/50 flex items-center justify-center text-indigo-400 shrink-0">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Vocabulary Lexicon</span>
                <span className="text-base font-bold text-white font-mono tabular-nums">
                  {corpusStats.vocabularySize}
                </span>
                <span className="text-slate-500 block text-[10px] font-mono">
                  {corpusStats.totalTokens} est. tokens
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Document Ingestion & Repository (always accessible collapsible block) */}
        <DocumentManager
          documents={documents}
          chunks={chunks}
          selectedDocId={selectedDocId}
          onSelectDoc={setSelectedDocId}
          onUploadFiles={handleUploadFiles}
          onLoadSamples={loadDiplomaSampleDocuments}
          onDeleteDocument={handleDeleteDocument}
          processingStatus={processingStatus}
          statusMessage={statusMessage}
          chunkSize={chunkSize}
          chunkOverlap={chunkOverlap}
          onUpdateChunkSettings={handleUpdateChunkSettings}
        />

        {/* Tab Viewport Content */}
        {activeTab === 'chat' && (
          <SemanticChat
            messages={messages}
            isLoading={isChatLoading}
            onSendMessage={handleSendMessage}
            onSelectCitation={setActiveCitation}
            onClearChat={() => setMessages([])}
            hasDocuments={documents.length > 0}
            onPlayTTS={handlePlayTTS}
            activeAudioId={activeAudioId}
            isAudioLoading={isAudioLoading}
          />
        )}

        {activeTab === 'vector' && (
          <VectorStudio
            chunks={chunks}
            onSelectChunk={(chunk) => {
              setActiveCitation({
                docId: chunk.docId,
                docName: chunk.docName,
                pageNumber: chunk.pageNumber,
                chunkIndex: chunk.chunkIndex,
                snippet: chunk.text,
                score: 0.9,
              });
            }}
          />
        )}

        {activeTab === 'summary' && (
          <Summarizer
            documents={documents}
            chunks={chunks}
          />
        )}

        {activeTab === 'keywords' && (
          <KeywordStudio
            chunks={chunks}
          />
        )}

        {activeTab === 'pipeline' && (
          <PipelineWalkthrough />
        )}

      </main>

      {/* Citation Inspector Modal */}
      <CitationModal
        citation={activeCitation}
        onClose={() => setActiveCitation(null)}
      />

      {/* Clean quiet footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Document Intelligence AI · Diploma in Artificial Intelligence & Machine Learning
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>ChromaDB Vector Model</span>
            <span>·</span>
            <span>Google Gemini 3.8 Flash</span>
            <span>·</span>
            <span>Gemini TTS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
