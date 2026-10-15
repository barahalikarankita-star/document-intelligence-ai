import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  BookMarked, 
  Sparkles, 
  AlertCircle,
  HelpCircle,
  RotateCcw,
  CheckCircle,
  Clock
} from 'lucide-react';
import { ChatMessage, CitationReference, DocumentChunk } from '../types';

interface SemanticChatProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (query: string) => void;
  onSelectCitation: (citation: CitationReference) => void;
  onClearChat: () => void;
  hasDocuments: boolean;
  onPlayTTS: (messageId: string, text: string) => void;
  activeAudioId: string | null;
  isAudioLoading: boolean;
}

const PRESET_QUESTIONS = [
  "Explain how Transformers use self-attention for document context",
  "What are the 18 Safe Harbor PHI identifiers required for healthcare AI?",
  "What are the latency budgets for real-time edge AI in autonomous driving?",
  "How does ChromaDB evaluate Cosine Distance during RAG retrieval?",
  "What is the Minimal Risk Maneuver (MRM) in autonomous vehicle safety?",
];

export const SemanticChat: React.FC<SemanticChatProps> = ({
  messages,
  isLoading,
  onSendMessage,
  onSelectCitation,
  onClearChat,
  hasDocuments,
  onPlayTTS,
  activeAudioId,
  isAudioLoading,
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition (Web Speech API)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript) {
            setInputText(currentTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleListening = () => {
    if (!speechSupported || !recognitionRef.current) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed || isLoading) return;
    onSendMessage(trimmed);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-[750px] bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      
      {/* Top Chat Bar */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-900/60 border border-indigo-700/50 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Semantic Document Question Answering
            </h3>
            <p className="text-xs text-slate-400">
              Retrieval-Augmented Generation (RAG) backed by Gemini 3.8 Flash & Vector Cosine Space
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={onClearChat}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition"
            title="Reset Conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center text-center max-w-lg mx-auto py-8">
            <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-indigo-400 mb-4">
              <BookMarked className="w-6 h-6" />
            </div>
            <h4 className="text-base font-semibold text-slate-200">
              Ask Any Question Grounded in Your Documents
            </h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              The NLP engine retrieves the top-K relevant chunks via vector similarity, then supplies them as verified context to Gemini for accurate, citation-backed answers.
            </p>

            {/* Educational Preset Chips */}
            <div className="mt-6 w-full text-left">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2 text-center">
                Recommended Diploma Inquiries:
              </span>
              <div className="flex flex-col gap-2">
                {PRESET_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(q)}
                    disabled={!hasDocuments || isLoading}
                    className="p-2.5 text-xs text-left text-slate-300 bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 rounded-lg transition disabled:opacity-40"
                  >
                    "{q}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map(msg => {
            const isUser = msg.role === 'user';
            const isPlayingThis = activeAudioId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 mt-1">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-3xl rounded-xl p-4 ${
                    isUser
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-950 border border-slate-800 text-slate-200'
                  }`}
                >
                  {/* User message */}
                  {isUser ? (
                    <p className="text-sm font-sans whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </p>
                  ) : (
                    <div>
                      {/* Assistant answer text */}
                      <div className="text-sm leading-relaxed whitespace-pre-wrap font-sans text-slate-200">
                        {msg.content}
                      </div>

                      {/* Key Insights */}
                      {msg.keyInsights && msg.keyInsights.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-slate-800/80">
                          <span className="text-xs font-semibold text-indigo-400 block mb-1.5">
                            Key Findings:
                          </span>
                          <ul className="space-y-1 text-xs text-slate-300">
                            {msg.keyInsights.map((insight, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <span className="text-indigo-400 font-bold">·</span>
                                <span>{insight}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Citation badges */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-slate-800/80">
                          <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                            <BookMarked className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Supporting Document Passages ({msg.citations.length}):</span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {msg.citations.map((cite, idx) => (
                              <button
                                key={idx}
                                onClick={() => onSelectCitation(cite)}
                                className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-400 rounded-md transition text-slate-300"
                              >
                                <span className="text-indigo-400 font-mono font-medium">
                                  #{cite.chunkIndex + 1}
                                </span>
                                <span className="truncate max-w-[140px]">{cite.docName}</span>
                                <span className="text-slate-500 font-mono">P.{cite.pageNumber}</span>
                                <span className="text-emerald-400 text-[10px] font-mono">
                                  {Math.round(cite.score * 100)}% match
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Assistant Footer: Audio TTS + Confidence */}
                      <div className="mt-4 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 font-mono">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onPlayTTS(msg.id, msg.content)}
                            disabled={isAudioLoading}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition text-xs ${
                              isPlayingThis
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                            }`}
                            title="Play voice read-out using Gemini TTS"
                          >
                            {isPlayingThis ? (
                              <>
                                <VolumeX className="w-3.5 h-3.5" />
                                <span>Stop Voice</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                                <span>Voice Readout</span>
                              </>
                            )}
                          </button>
                        </div>

                        {msg.confidence && (
                          <div className="flex items-center gap-1.5">
                            <span>Grounding Confidence:</span>
                            <span className={`font-semibold ${
                              msg.confidence === 'High' 
                                ? 'text-emerald-400' 
                                : msg.confidence === 'Moderate' 
                                  ? 'text-amber-400' 
                                  : 'text-slate-400'
                            }`}>
                              {msg.confidence}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 shrink-0 mt-1">
                    <span className="text-xs font-semibold">You</span>
                  </div>
                )}
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 mt-1">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 flex items-center gap-3">
              <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              <span>Retrieving vector passages & synthesizing response via Gemini...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Question Input Zone */}
      <div className="p-4 bg-slate-950 border-t border-slate-800">
        {!hasDocuments && (
          <div className="mb-2 text-xs text-amber-400 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Please upload or load sample documents to ask questions grounded in text.</span>
          </div>
        )}

        <div className="relative flex items-center gap-2">
          {/* Voice Input Mic */}
          <button
            onClick={toggleListening}
            disabled={isLoading}
            className={`p-2.5 rounded-lg border transition ${
              isListening
                ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                : 'bg-slate-900 text-slate-300 hover:text-white border-slate-800 hover:bg-slate-800'
            }`}
            title={isListening ? 'Stop listening' : 'Start voice input (SpeechRecognition)'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isListening
                ? 'Listening to microphone...'
                : hasDocuments
                  ? 'Ask a question about the uploaded documents (e.g., "What are the latency constraints?")...'
                  : 'Load documents to enable question answering...'
            }
            rows={2}
            disabled={isLoading}
            className="flex-1 bg-slate-900 border border-slate-800 text-slate-100 placeholder:text-slate-500 rounded-lg p-2.5 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 resize-none font-sans"
          />

          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg disabled:opacity-40 transition shrink-0"
            title="Ask AI"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-mono">
          <span>Shift+Enter for newline · Enter to send</span>
          {isListening && (
            <span className="text-rose-400 font-semibold animate-pulse">
              Microphone active · Speak now
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
