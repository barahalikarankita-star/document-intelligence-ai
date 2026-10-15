import React, { useState } from 'react';
import { 
  FileUp, 
  FileText, 
  Scissors, 
  Binary, 
  Database, 
  BrainCircuit, 
  Mic, 
  ArrowRight, 
  CheckCircle2, 
  Code,
  BookOpen
} from 'lucide-react';

interface StageInfo {
  number: number;
  title: string;
  shortDesc: string;
  tech: string;
  icon: any;
  input: string;
  output: string;
  theory: string;
  mathFormula?: string;
  codeSnippet: string;
}

const PIPELINE_STAGES: StageInfo[] = [
  {
    number: 1,
    title: 'Document Upload & Validation',
    shortDesc: 'Ingests PDF, TXT, and clinical/technical files with session-scoped sandboxing.',
    tech: 'HTML5 File API / PyMuPDF / Streamlit',
    icon: FileUp,
    input: 'Binary PDF or text streams from user or benchmark repository.',
    output: 'Validated ArrayBuffer with MIME-type verification and metadata header.',
    theory: 'Preserves raw page boundaries and document metadata (file size, timestamp, title) while ensuring strict security isolation.',
    codeSnippet: `// Stage 1: Document validation & memory sandbox
const fileBuffer = await file.arrayBuffer();
const meta = { name: file.name, size: file.size, type: file.type };`
  },
  {
    number: 2,
    title: 'PDF Text Extraction & Page Tracking',
    shortDesc: 'Extracts unicode text streams per page, preserving exact page numbering.',
    tech: 'pdfjs-dist / PyMuPDF (fitz)',
    icon: FileText,
    input: 'PDF ArrayBuffer with font encodings and layout descriptors.',
    output: 'Array of DocumentPages with page numbers, text string, and character count.',
    theory: 'Iterates through each page object in the PDF DOM. Normalizes non-printable characters and maintains exact page-level coordinates for verifiable citations.',
    codeSnippet: `// Stage 2: Page-by-page text extraction
const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
for (let i = 1; i <= pdf.numPages; i++) {
  const page = await pdf.getPage(i);
  const textContent = await page.getTextContent();
  pages.push({ pageNumber: i, text: cleanText(textContent) });
}`
  },
  {
    number: 3,
    title: 'NLP Preprocessing & Chunking',
    shortDesc: 'Segments documents into overlapping passages preserving linguistic boundaries.',
    tech: 'NLTK Tokenizer / Sentence Boundary Detection',
    icon: Scissors,
    input: 'Raw text per page.',
    output: 'DocumentChunks with chunkIndex, pageNumber, token count, and word offsets.',
    theory: 'Uses a sliding window with configurable chunk size (L) and overlap (O). Overlap prevents contextual clipping of sentences that cross chunk boundaries.',
    mathFormula: 'Chunk_{i} = [W_{i \\cdot (L - O)}, \\, W_{i \\cdot (L - O) + L}]',
    codeSnippet: `// Stage 3: Sliding window chunk partition
let start = 0;
while (start < words.length) {
  const end = Math.min(start + chunkSize, words.length);
  chunks.push({ text: words.slice(start, end).join(' ') });
  start += Math.max(1, chunkSize - chunkOverlap);
}`
  },
  {
    number: 4,
    title: 'Embedding Generation',
    shortDesc: 'Maps text chunks into dense, normalized continuous vector representations.',
    tech: 'Sentence Transformers / Gemini Embedding 2',
    icon: Binary,
    input: 'Cleaned chunk text passages.',
    output: '768-dimensional normalized floating point vectors.',
    theory: 'Encodes semantic meaning into geometric proximity. Chunks with similar semantic concepts reside in close angular proximity in vector space.',
    mathFormula: '\\vec{v} = \\frac{\\text{Encoder}(T)}{\\|\\text{Encoder}(T)\\|_2}',
    codeSnippet: `// Stage 4: Dense Vector Encoding
const embedding = await ai.models.embedContent({
  model: 'gemini-embedding-2-preview',
  contents: chunk.text
});`
  },
  {
    number: 5,
    title: 'ChromaDB Vector Store & Semantic Retrieval',
    shortDesc: 'Indexes vectors in HNSW graphs to compute nearest-neighbor cosine similarity.',
    tech: 'ChromaDB / HNSW Indexing / Cosine Distance',
    icon: Database,
    input: 'User query string and top-K parameter.',
    output: 'K most relevant document chunks ranked by cosine similarity score.',
    theory: 'Computes Cosine Distance between the query embedding and all indexed chunk vectors using Hierarchical Navigable Small World graphs.',
    mathFormula: 'S_{\\text{Cosine}}(\\vec{q}, \\vec{c}) = \\frac{\\vec{q} \\cdot \\vec{c}}{\\|\\vec{q}\\|_2 \\|\\vec{c}\\|_2}',
    codeSnippet: `// Stage 5: Top-K Vector Retrieval
const topChunks = retrieveTopKChunks(userQuery, indexedChunks, k=4);
// Rank chunks where distance = 1 - cosineSimilarity(q, c)`
  },
  {
    number: 6,
    title: 'Context-Augmented Prompting (Gemini 3.8 Flash)',
    shortDesc: 'Generates factual answers with explicit page and chunk source citations.',
    tech: 'Google Gemini 3.8 Flash / RAG Framework',
    icon: BrainCircuit,
    input: 'User question + retrieved top-K context chunks.',
    output: 'Grounded answer with inline citation tags, key takeaways, and confidence rating.',
    theory: 'Implements bounded prompting where the LLM is constrained strictly to the provided document passages, mitigating hallucination and guaranteeing traceability.',
    codeSnippet: `// Stage 6: Grounded Generation with Gemini
const response = await ai.models.generateContent({
  model: 'gemini-3.8-flash',
  contents: buildPromptWithRetrievedContext(query, topChunks),
  config: { temperature: 0.2 }
});`
  },
  {
    number: 7,
    title: 'Speech Interaction & Voice Output',
    shortDesc: 'Enables hands-free microphone voice queries and speech synthesis playback.',
    tech: 'Web Speech API / Gemini 3.8 Flash Lite TTS',
    icon: Mic,
    input: 'Microphone audio input (transcribed) / Generated text answer (spoken).',
    output: 'Real-time transcribed prompt & 24kHz synthesized WAV audio readout.',
    theory: 'Completes the interactive loop by converting speech to text for query ingestion and streaming audio synthesis for voice feedback.',
    codeSnippet: `// Stage 7: Gemini Flash Lite TTS
const speech = await ai.models.generateContent({
  model: 'gemini-3.8-flash-lite-tts',
  contents: [{ role: 'user', parts: [{ text: answerText }] }],
  config: { responseModalities: ['AUDIO'] }
});`
  }
];

export const PipelineWalkthrough: React.FC = () => {
  const [activeStage, setActiveStage] = useState<number>(1);
  const current = PIPELINE_STAGES.find(s => s.number === activeStage) || PIPELINE_STAGES[0];

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <span>Document Intelligence 7-Stage Architecture</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Curriculum pipeline for the Diploma in Artificial Intelligence & Machine Learning.
            </p>
          </div>

          <div className="text-xs font-mono text-slate-400 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg">
            Interactive Architecture Inspector
          </div>
        </div>

        {/* 7-Step Interactive Progress Bar */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {PIPELINE_STAGES.map(stage => {
            const Icon = stage.icon;
            const isSelected = activeStage === stage.number;

            return (
              <button
                key={stage.number}
                onClick={() => setActiveStage(stage.number)}
                className={`p-3 rounded-lg border text-left transition flex flex-col justify-between h-24 ${
                  isSelected
                    ? 'bg-indigo-950/80 border-indigo-500 shadow-md ring-1 ring-indigo-500/40'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-[11px] font-mono font-bold ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`}>
                    0{stage.number}
                  </span>
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                </div>
                <div className="text-xs font-medium text-slate-200 line-clamp-2">
                  {stage.title}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Stage Deep-Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Theoretical Foundations (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0">
              <current.icon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider block">
                Stage 0{current.number} of 07
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {current.title}
              </h3>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Technical Rationale & NLP Theory
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              {current.theory}
            </p>
          </div>

          {current.mathFormula && (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
              <span className="text-[11px] font-mono text-slate-400 block mb-1">
                Mathematical Foundation:
              </span>
              <div className="text-xs sm:text-sm font-mono text-indigo-300 font-semibold">
                {current.mathFormula}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1">
                Data Input
              </span>
              <p className="text-xs text-slate-300 font-sans">{current.input}</p>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1">
                Data Output
              </span>
              <p className="text-xs text-slate-300 font-sans">{current.output}</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 text-xs font-mono text-slate-400">
            <span>Primary Technology:</span>
            <span className="text-slate-200 font-semibold">{current.tech}</span>
          </div>
        </div>

        {/* Right Column: Code Implementation (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Code className="w-4 h-4 text-indigo-400" />
                <span>Reference Implementation</span>
              </h4>
              <span className="text-[10px] font-mono text-slate-500">TypeScript / Python</span>
            </div>

            <pre className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-indigo-200 overflow-x-auto leading-relaxed">
              <code>{current.codeSnippet}</code>
            </pre>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => setActiveStage(Math.max(1, activeStage - 1))}
              disabled={activeStage === 1}
              className="px-3 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded transition disabled:opacity-30"
            >
              Previous Stage
            </button>

            <span className="text-xs font-mono text-slate-500">
              {activeStage} / {PIPELINE_STAGES.length}
            </span>

            <button
              onClick={() => setActiveStage(Math.min(PIPELINE_STAGES.length, activeStage + 1))}
              disabled={activeStage === PIPELINE_STAGES.length}
              className="px-3 py-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-500 rounded transition disabled:opacity-30"
            >
              Next Stage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
