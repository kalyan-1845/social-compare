import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MessageSquareCode, Info, User, HelpCircle } from 'lucide-react';
import { ChatMessage, Citation, streamRAGResponse } from '../lib/api';

interface ChatInterfaceProps {
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

export default function ChatInterface({ chatHistory, setChatHistory }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeCitations, setActiveCitations] = useState<Citation[]>([]);
  const [streamingText, setStreamingText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Refs to track latest values across async closure boundaries
  const streamingTextRef = useRef('');
  const activeCitationsRef = useRef<Citation[]>([]);

  // Suggestion chips
  const suggestions = [
    "Why did Video A perform better?",
    "Compare the hooks in the first 5 seconds.",
    "What improvements should Video B make?",
    "Show me a structured breakdown of engagement rates.",
    "Which creator holds the audience better?"
  ];

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, streamingText, isStreaming]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isStreaming) return;

    const userMessage: ChatMessage = { role: 'user', content: textToSend };
    
    // Add user message to history
    setChatHistory(prev => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);
    setStreamingText('');
    setErrorMessage('');
    setActiveCitations([]);
    streamingTextRef.current = '';
    activeCitationsRef.current = [];

    // Call streaming API helper
    await streamRAGResponse(
      textToSend,
      [...chatHistory, userMessage],
      (citations) => {
        activeCitationsRef.current = citations;
        setActiveCitations(citations);
      },
      (token) => {
        streamingTextRef.current += token;
        setStreamingText(prev => prev + token);
      },
      () => {
        // Complete Callback — read from refs to avoid stale closure values
        const finalText = streamingTextRef.current;
        const finalCitations = activeCitationsRef.current;
        setChatHistory(prev => [
          ...prev, 
          { 
            role: 'assistant', 
            content: finalText, 
            citations: finalCitations 
          }
        ]);
        setStreamingText('');
        setActiveCitations([]);
        streamingTextRef.current = '';
        activeCitationsRef.current = [];
        setIsStreaming(false);
      },
      (error) => {
        // Error Callback
        setErrorMessage(error);
        setIsStreaming(false);
      }
    );
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  return (
    <div className="glass-panel rounded-2xl flex flex-col h-[650px] relative overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 bg-white/1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquareCode className="w-5 h-5 text-brandPurple" />
          <h3 className="text-base font-bold text-white">Comparative Creator AI</h3>
        </div>
        <div className="flex items-center gap-1.5 bg-brandPurple/10 border border-brandPurple/20 text-brandPurple text-[10px] font-bold tracking-wider px-2 py-0.5 rounded uppercase">
          <Sparkles className="w-3 h-3 text-pink-400" />
          Multi-Turn RAG Context
        </div>
      </div>

      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {chatHistory.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brandPurple/10 border border-brandPurple/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-brandPurple animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Compare Strategic Creator Formats</h4>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Ask comparative strategic questions about hook retention, views distribution, uploader strategies, and structural loop dynamics.
              </p>
            </div>
          </div>
        )}

        {chatHistory.map((msg, index) => (
          <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-brandPurple/15 border border-brandPurple/20 flex items-center justify-center text-brandPurple font-bold shrink-0">
                AI
              </div>
            )}
            
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 flex flex-col ${
              msg.role === 'user'
                ? 'bg-brandPurple text-white rounded-tr-sm font-medium text-sm'
                : 'bg-white/3 border border-white/5 text-gray-100 rounded-tl-sm text-sm leading-relaxed'
            }`}>
              <span>{msg.content}</span>
              
              {/* Citation Badges for stored history responses */}
              {msg.role === 'assistant' && msg.citations && msg.citations.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-white/5">
                  {msg.citations.map((cit, idx) => (
                    <div 
                      key={idx} 
                      className={`group relative flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border transition-all cursor-help ${
                        cit.video_id === 'A' 
                          ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20' 
                          : 'bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border-pink-500/20'
                      }`}
                    >
                      <Info className="w-3 h-3" />
                      <span>Video {cit.video_id} @ {cit.timestamp}</span>
                      
                      {/* Detailed citation tooltip */}
                      <span className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 text-gray-300 w-60 rounded-lg p-2.5 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[10px] leading-relaxed z-50">
                        <strong className="text-white block mb-1">
                          Source Segment: Video {cit.video_id} ({cit.source_platform})
                        </strong>
                        "{cit.content}"
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 font-bold shrink-0">
                <User className="w-4 h-4 text-gray-400" />
              </div>
            )}
          </div>
        ))}

        {/* Live Streaming Response Loader */}
        {isStreaming && streamingText && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-lg bg-brandPurple/15 border border-brandPurple/20 flex items-center justify-center text-brandPurple font-bold shrink-0 animate-pulse">
              AI
            </div>
            <div className="max-w-[80%] rounded-2xl rounded-tl-sm px-4 py-3 bg-white/3 border border-white/5 text-gray-100 text-sm leading-relaxed streaming-cursor">
              <span>{streamingText}</span>
              
              {/* Dynamic Citations populated during stream */}
              {activeCitations.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-white/5 animate-fade-in">
                  {activeCitations.map((cit, idx) => (
                    <div 
                      key={idx} 
                      className={`group relative flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border transition-all cursor-help ${
                        cit.video_id === 'A' 
                          ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20' 
                          : 'bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border-pink-500/20'
                      }`}
                    >
                      <Info className="w-3 h-3" />
                      <span>Video {cit.video_id} @ {cit.timestamp}</span>
                      
                      <span className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 text-gray-300 w-60 rounded-lg p-2.5 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[10px] leading-relaxed z-50">
                        <strong className="text-white block mb-1">
                          Source Segment: Video {cit.video_id} ({cit.source_platform})
                        </strong>
                        "{cit.content}"
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Streaming Buffer without text yet */}
        {isStreaming && !streamingText && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-lg bg-brandPurple/15 border border-brandPurple/20 flex items-center justify-center text-brandPurple font-bold shrink-0 animate-bounce">
              AI
            </div>
            <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-white/3 border border-white/5 flex gap-1.5 py-4 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-brandPurple animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-brandPurple animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-brandPurple animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="flex gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl text-xs max-w-md mx-auto items-center">
            <HelpCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Chips (Only shows if not streaming and history exists or empty) */}
      {!isStreaming && (
        <div className="px-6 py-2 bg-black/10 border-t border-white/5 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
          {suggestions.map((sug, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(sug)}
              className="bg-white/3 hover:bg-brandPurple/15 hover:border-brandPurple/30 text-[10px] font-medium text-gray-300 hover:text-brandPurple px-3 py-1 rounded-full border border-white/5 transition-all text-xs shrink-0 select-none"
            >
              {sug}
            </button>
          ))}
        </div>
      )}

      {/* Message Input Form */}
      <form onSubmit={handleFormSubmit} className="p-4 border-t border-white/5 bg-white/1 flex items-center gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isStreaming ? "Comparative AI is typing..." : "Ask comparative video strategy questions..."}
          disabled={isStreaming}
          className="flex-1 bg-[#090C15] border border-white/8 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brandPurple/60 focus:ring-1 focus:ring-brandPurple/40 text-white placeholder-gray-500 transition-all disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isStreaming || !input.trim()}
          className="bg-brandPurple hover:bg-brandPurple/90 disabled:bg-white/4 text-white hover:text-white disabled:text-gray-500 w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border border-white/10 transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
