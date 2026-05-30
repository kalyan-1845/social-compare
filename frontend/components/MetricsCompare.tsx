import React from 'react';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { VideoMetadata } from '../lib/api';

interface MetricsCompareProps {
  videoA: VideoMetadata;
  videoB: VideoMetadata;
}

export default function MetricsCompare({ videoA, videoB }: MetricsCompareProps) {
  
  // Calculate percentage difference helper
  const getDifference = (valA: number, valB: number) => {
    if (valA === valB) return { percent: 0, winner: 'Tie', text: 'tied' };
    
    if (valB > valA) {
      const diff = valA > 0 ? ((valB - valA) / valA) * 100 : 100;
      return {
        percent: Math.round(diff),
        winner: 'Video B',
        text: `+${Math.round(diff)}% higher on Instagram Reel`
      };
    } else {
      const diff = valB > 0 ? ((valA - valB) / valB) * 100 : 100;
      return {
        percent: Math.round(diff),
        winner: 'Video A',
        text: `+${Math.round(diff)}% higher on YouTube Video`
      };
    }
  };

  const compareViews = getDifference(videoA.views, videoB.views);
  const compareLikes = getDifference(videoA.likes, videoB.likes);
  const compareComments = getDifference(videoA.comments, videoB.comments);
  const compareEngagement = getDifference(videoA.engagement_rate, videoB.engagement_rate);

  // Overall winner based on engagement rate
  const overallWinner = videoB.engagement_rate >= videoA.engagement_rate ? {
    platform: 'Instagram Reel (Video B)',
    creator: videoB.creator,
    rate: videoB.engagement_rate,
    style: 'from-pink-500 to-purple-500 text-pink-400'
  } : {
    platform: 'YouTube Video (Video A)',
    creator: videoA.creator,
    rate: videoA.engagement_rate,
    style: 'from-red-500 to-orange-500 text-red-400'
  };

  return (
    <div className="glass-panel rounded-2xl p-6 transition-all duration-300">
      <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-brandPurple" />
        Performance Comparison
      </h3>

      {/* Winner Summary Banner */}
      <div className="bg-white/2 border border-white/5 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-gray-400 tracking-wider uppercase block mb-1">
            Overall Engagement Winner
          </span>
          <span className="text-base font-bold text-white block">
            {overallWinner.platform}
          </span>
          <span className="text-xs text-gray-400">
            Managed by <strong className="text-gray-300">@{overallWinner.creator}</strong> with a <strong className="text-emerald-400">{overallWinner.rate}%</strong> engagement rate.
          </span>
        </div>
        <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-lg text-xs font-bold">
          <ArrowUpRight className="w-4 h-4" />
          Optimal Hook Delivery
        </div>
      </div>

      {/* Detailed Metrics List */}
      <div className="space-y-4">
        {/* Engagement Compare */}
        <div>
          <div className="flex justify-between text-xs font-medium mb-1.5">
            <span className="text-gray-400">Engagement Advantage</span>
            <span className={compareEngagement.winner === 'Video B' ? 'text-pink-400 font-semibold' : 'text-red-400 font-semibold'}>
              {compareEngagement.text}
            </span>
          </div>
          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden flex">
            <div 
              className="bg-red-500 h-full transition-all duration-500" 
              style={{ width: `${(videoA.engagement_rate / (videoA.engagement_rate + videoB.engagement_rate)) * 100}%` }}
            />
            <div 
              className="bg-pink-500 h-full transition-all duration-500" 
              style={{ width: `${(videoB.engagement_rate / (videoA.engagement_rate + videoB.engagement_rate)) * 100}%` }}
            />
          </div>
        </div>

        {/* Views Compare */}
        <div>
          <div className="flex justify-between text-xs font-medium mb-1.5">
            <span className="text-gray-400">View Distribution</span>
            <span className={compareViews.winner === 'Video B' ? 'text-pink-400 font-semibold' : 'text-red-400 font-semibold'}>
              {compareViews.text}
            </span>
          </div>
          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden flex">
            <div 
              className="bg-red-500 h-full transition-all duration-500" 
              style={{ width: `${(videoA.views / (videoA.views + videoB.views)) * 100}%` }}
            />
            <div 
              className="bg-pink-500 h-full transition-all duration-500" 
              style={{ width: `${(videoB.views / (videoA.views + videoB.views)) * 100}%` }}
            />
          </div>
        </div>

        {/* Likes Compare */}
        <div>
          <div className="flex justify-between text-xs font-medium mb-1.5">
            <span className="text-gray-400">Likes Advantage</span>
            <span className={compareLikes.winner === 'Video B' ? 'text-pink-400 font-semibold' : 'text-red-400 font-semibold'}>
              {compareLikes.text}
            </span>
          </div>
          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden flex">
            <div 
              className="bg-red-500 h-full transition-all duration-500" 
              style={{ width: `${(videoA.likes / (videoA.likes + videoB.likes)) * 100}%` }}
            />
            <div 
              className="bg-pink-500 h-full transition-all duration-500" 
              style={{ width: `${(videoB.likes / (videoA.likes + videoB.likes)) * 100}%` }}
            />
          </div>
        </div>

        {/* Comments Compare */}
        <div>
          <div className="flex justify-between text-xs font-medium mb-1.5">
            <span className="text-gray-400">Comment Ratio</span>
            <span className={compareComments.winner === 'Video B' ? 'text-pink-400 font-semibold' : 'text-red-400 font-semibold'}>
              {compareComments.text}
            </span>
          </div>
          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden flex">
            <div 
              className="bg-red-500 h-full transition-all duration-500" 
              style={{ width: `${(videoA.comments / (videoA.comments + videoB.comments)) * 100}%` }}
            />
            <div 
              className="bg-pink-500 h-full transition-all duration-500" 
              style={{ width: `${(videoB.comments / (videoA.comments + videoB.comments)) * 100}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center gap-4 mt-6 pt-4 border-t border-white/5 justify-center text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span className="text-gray-400">Video A (YouTube)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
          <span className="text-gray-400">Video B (Instagram)</span>
        </div>
      </div>
    </div>
  );
}
