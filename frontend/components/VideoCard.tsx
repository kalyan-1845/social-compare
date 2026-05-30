import React from 'react';
import { Eye, Heart, MessageSquare, Calendar, Clock, Award } from 'lucide-react';
import { VideoMetadata } from '../lib/api';

interface VideoCardProps {
  data: VideoMetadata;
  platform: 'YouTube' | 'Instagram';
  letter: 'A' | 'B';
  isWinner?: boolean;
}

export default function VideoCard({ data, platform, letter, isWinner }: VideoCardProps) {
  const isYT = platform === 'YouTube';
  
  // Format numbers nicely with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  // Helper to format duration to MM:SS or HH:MM:SS
  const formatDuration = (seconds: number) => {
    if (!seconds) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-6 relative overflow-hidden transition-all duration-300">
      {/* Top Banner Accent */}
      <div className={`absolute top-0 left-0 w-full h-[4px] ${
        isYT ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500'
      }`} />

      {/* Winner Indicator */}
      {isWinner && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold tracking-wide backdrop-blur-md">
          <Award className="w-3.5 h-3.5" />
          Higher Engagement
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-4 mt-2">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg ${
          isYT ? 'bg-red-600/25 border border-red-500/40 text-red-400' : 'bg-pink-600/25 border border-pink-500/40 text-pink-400'
        }`}>
          {letter}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md ${
              isYT ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
            }`}>
              {platform}
            </span>
            <span className="text-xs text-gray-400 font-medium">@{data.creator}</span>
            {data.follower_count !== undefined && data.follower_count > 0 && (
              <span className="text-[10px] text-gray-500 bg-white/5 border border-white/5 px-1.5 py-0.5 rounded-md font-mono">
                {isYT ? 'Subs: ' : 'Followers: '}{formatNumber(data.follower_count)}
              </span>
            )}
          </div>
          <h3 className="text-base font-bold text-white truncate pr-16" title={data.title}>
            {data.title}
          </h3>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        {/* Views */}
        <div className="bg-white/2 rounded-xl p-3.5 border border-white/4">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-1.5">
            <Eye className="w-4 h-4 text-sky-400" />
            <span>Views</span>
          </div>
          <span className="text-lg font-bold text-white tracking-tight">
            {formatNumber(data.views)}
          </span>
        </div>

        {/* Engagement Rate */}
        <div className="bg-white/2 rounded-xl p-3.5 border border-white/4">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-1.5">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Engagement</span>
          </div>
          <span className="text-lg font-bold text-emerald-400 tracking-tight">
            {data.engagement_rate}%
          </span>
        </div>

        {/* Likes */}
        <div className="bg-white/2 rounded-xl p-3.5 border border-white/4">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-1.5">
            <Heart className="w-4 h-4 text-pink-500" />
            <span>Likes</span>
          </div>
          <span className="text-base font-semibold text-white">
            {formatNumber(data.likes)}
          </span>
        </div>

        {/* Comments */}
        <div className="bg-white/2 rounded-xl p-3.5 border border-white/4">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-1.5">
            <MessageSquare className="w-4 h-4 text-purple-400" />
            <span>Comments</span>
          </div>
          <span className="text-base font-semibold text-white">
            {formatNumber(data.comments)}
          </span>
        </div>
      </div>

      {/* Meta Indicators */}
      <div className="flex items-center gap-4 mt-5 pt-4 border-t border-white/5 text-xs text-gray-400">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-gray-500" />
          <span>{formatDuration(data.duration)}</span>
        </div>
        {data.upload_date && data.upload_date !== 'Unknown Date' && (
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-gray-500" />
            <span>{data.upload_date}</span>
          </div>
        )}
      </div>

      {/* Hashtags */}
      {data.hashtags && data.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4">
          {data.hashtags.slice(0, 4).map((tag, idx) => (
            <span key={idx} className="bg-white/4 hover:bg-white/8 text-[10px] text-gray-300 font-medium px-2 py-0.5 rounded border border-white/5 transition-all">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
