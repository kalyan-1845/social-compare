'use client';

import React, { useState } from 'react';
import { Video, Film, Sparkles, AlertCircle, ArrowLeft, RefreshCw, BarChart2 } from 'lucide-react';
import { analyzeCreatorVideos, VideoMetadata, ChatMessage } from '../lib/api';
import VideoCard from '../components/VideoCard';
import MetricsCompare from '../components/MetricsCompare';
import ChatInterface from '../components/ChatInterface';

export default function Home() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [videoA, setVideoA] = useState<VideoMetadata | null>(null);
  const [videoB, setVideoB] = useState<VideoMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl.trim() || !instagramUrl.trim()) {
      setError('Please provide both a YouTube video URL and an Instagram Reel URL to begin.');
      return;
    }

    setIsLoading(true);
    setError('');
    setVideoA(null);
    setVideoB(null);
    setChatHistory([]);

    try {
      const data = await analyzeCreatorVideos(youtubeUrl, instagramUrl);
      if (data.success) {
        setVideoA(data.video_a);
        setVideoB(data.video_b);
      } else {
        setError('Failed to extract metrics. Verify uploader server connections and try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during video analysis. Make sure the backend is active.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setVideoA(null);
    setVideoB(null);
    setYoutubeUrl('');
    setInstagramUrl('');
    setChatHistory([]);
    setError('');
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl min-h-screen flex flex-col justify-between">
      
      {/* Upper Navigation / Title */}
      <header className="mb-10 text-center relative z-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-brandPurple/10 border border-brandPurple/20 text-brandPurple rounded-full text-xs font-bold tracking-wider uppercase mb-3">
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          RAG Creator Analytics
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Creator <span className="bg-gradient-to-r from-brandPurple to-brandPink bg-clip-text text-transparent">Video Compare</span>
        </h1>
        <p className="text-gray-400 text-sm sm:text-base mt-2 max-w-xl mx-auto leading-relaxed">
          Ingest transcripts, compute engagement rates, and compare hooks side-by-side using advanced vector database context retrieval.
        </p>
      </header>

      {/* Main Container */}
      <div className="flex-1 relative z-20">
        
        {/* State A: Inputs Form */}
        {!videoA && !videoB && (
          <div className="max-w-2xl mx-auto">
            <div className="glass-panel rounded-3xl p-8 relative overflow-hidden transition-all duration-300">
              
              <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-brandPurple to-brandPink" />
              
              <form onSubmit={handleAnalyze} className="space-y-6">
                
                {/* YouTube URL */}
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wider text-gray-300 uppercase flex items-center gap-2">
                    <Video className="w-4 h-4 text-red-500" />
                    YouTube Video URL
                  </label>
                  <input
                    type="url"
                    required
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    disabled={isLoading}
                    className="w-full bg-[#090C15] border border-white/8 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brandPurple/60 focus:ring-1 focus:ring-brandPurple/40 text-white placeholder-gray-600 transition-all disabled:opacity-50"
                  />
                </div>

                {/* Instagram URL */}
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wider text-gray-300 uppercase flex items-center gap-2">
                    <Film className="w-4 h-4 text-pink-500" />
                    Instagram Reel URL
                  </label>
                  <input
                    type="url"
                    required
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    placeholder="https://www.instagram.com/reel/..."
                    disabled={isLoading}
                    className="w-full bg-[#090C15] border border-white/8 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brandPurple/60 focus:ring-1 focus:ring-brandPurple/40 text-white placeholder-gray-600 transition-all disabled:opacity-50"
                  />
                </div>

                {/* Error Box */}
                {error && (
                  <div className="flex gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs items-center animate-fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full relative group overflow-hidden bg-brandPurple hover:bg-brandPurple/90 text-white hover:text-white font-bold py-3.5 px-6 rounded-xl border border-white/10 shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Analyzing Creators & Transcribing Audio...
                    </>
                  ) : (
                    <>
                      <BarChart2 className="w-4 h-4" />
                      Analyze Creator Videos
                    </>
                  )}
                  {/* Subtle hover background glow */}
                  <span className="absolute inset-0 w-full h-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

              </form>
            </div>
            
            {/* Quick Helper Notes */}
            <p className="text-center text-[10px] text-gray-500 mt-4 leading-relaxed max-w-md mx-auto">
              Note: Instagram reels downloading uses yt-dlp to capture audio streams which are dynamically transcribed by OpenAI Whisper for detailed vector embeddings analysis.
            </p>
          </div>
        )}

        {/* State B: Ingested Dashboard */}
        {videoA && videoB && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Control Bar */}
            <div className="flex justify-between items-center bg-white/2 border border-white/5 px-4 py-3 rounded-xl">
              <button 
                onClick={handleReset}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-all bg-white/4 px-3 py-1.5 rounded-lg border border-white/5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Analyze New Videos
              </button>
              <div className="text-[10px] font-mono text-gray-500 hidden sm:block">
                DB Collections Status: INDEXED & ACTIVE
              </div>
            </div>

            {/* Side-by-Side Video Metric Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <VideoCard 
                data={videoA} 
                platform="YouTube" 
                letter="A" 
                isWinner={videoA.engagement_rate > videoB.engagement_rate}
              />
              <VideoCard 
                data={videoB} 
                platform="Instagram" 
                letter="B" 
                isWinner={videoB.engagement_rate >= videoA.engagement_rate}
              />
            </div>

            {/* Metrics Breakdown & Comparative Chat */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Stats Compare Sidebar */}
              <div className="lg:col-span-1">
                <MetricsCompare videoA={videoA} videoB={videoB} />
              </div>
              
              {/* Chat Interface Workspace */}
              <div className="lg:col-span-2">
                <ChatInterface chatHistory={chatHistory} setChatHistory={setChatHistory} />
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Footer Branding */}
      <footer className="mt-16 pt-8 border-t border-white/5 text-center text-xs text-gray-500 relative z-20">
        <p>&copy; {new Date().getFullYear()} Creator Video Compare MVP. Built for ultra-low latency RAG insights.</p>
      </footer>
    </div>
  );
}
