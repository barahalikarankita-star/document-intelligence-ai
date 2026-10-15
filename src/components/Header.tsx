import React from 'react';
import { 
  FileText, 
  Database, 
  MessageSquare, 
  Sparkles, 
  Tag, 
  Cpu, 
  UploadCloud 
} from 'lucide-react';

export type ActiveTab = 'chat' | 'vector' | 'summary' | 'keywords' | 'pipeline';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  documentCount: number;
  totalChunks: number;
  onUploadClick: () => void;
  isProcessing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  documentCount,
  totalChunks,
  onUploadClick,
  isProcessing,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <a href="/" className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
              Document Intelligence AI
            </a>
          </div>

          {/* Zone 2: Navigation links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <button
              onClick={() => onTabChange('chat')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'chat'
                  ? 'bg-slate-800 text-indigo-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Semantic Q&A</span>
            </button>

            <button
              onClick={() => onTabChange('vector')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'vector'
                  ? 'bg-slate-800 text-indigo-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Vector Store</span>
            </button>

            <button
              onClick={() => onTabChange('summary')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'summary'
                  ? 'bg-slate-800 text-indigo-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Summarizer</span>
            </button>

            <button
              onClick={() => onTabChange('keywords')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'keywords'
                  ? 'bg-slate-800 text-indigo-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>Keywords</span>
            </button>

            <button
              onClick={() => onTabChange('pipeline')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'pipeline'
                  ? 'bg-slate-800 text-indigo-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>AI Pipeline</span>
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onUploadClick}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 active:scale-98 transition shadow-sm shadow-indigo-600/30 whitespace-nowrap shrink-0 disabled:opacity-50"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Document</span>
            </button>
          </div>
        </div>

        {/* Mobile Tab row */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800 overflow-x-auto gap-1">
          <button
            onClick={() => onTabChange('chat')}
            className={`px-2.5 py-1 text-xs rounded whitespace-nowrap ${activeTab === 'chat' ? 'bg-slate-800 text-indigo-400 font-medium' : 'text-slate-400'}`}
          >
            Q&A
          </button>
          <button
            onClick={() => onTabChange('vector')}
            className={`px-2.5 py-1 text-xs rounded whitespace-nowrap ${activeTab === 'vector' ? 'bg-slate-800 text-indigo-400 font-medium' : 'text-slate-400'}`}
          >
            Vector Store
          </button>
          <button
            onClick={() => onTabChange('summary')}
            className={`px-2.5 py-1 text-xs rounded whitespace-nowrap ${activeTab === 'summary' ? 'bg-slate-800 text-indigo-400 font-medium' : 'text-slate-400'}`}
          >
            Summarizer
          </button>
          <button
            onClick={() => onTabChange('keywords')}
            className={`px-2.5 py-1 text-xs rounded whitespace-nowrap ${activeTab === 'keywords' ? 'bg-slate-800 text-indigo-400 font-medium' : 'text-slate-400'}`}
          >
            Keywords
          </button>
          <button
            onClick={() => onTabChange('pipeline')}
            className={`px-2.5 py-1 text-xs rounded whitespace-nowrap ${activeTab === 'pipeline' ? 'bg-slate-800 text-indigo-400 font-medium' : 'text-slate-400'}`}
          >
            Pipeline
          </button>
        </div>
      </div>
    </header>
  );
};
