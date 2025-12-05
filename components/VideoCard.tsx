
import React from 'react';
import { VideoResult } from '../types';
import { ExternalLink, Clock, PlayCircle } from 'lucide-react';

interface VideoCardProps {
  result: VideoResult;
  searchQuery: string;
}

const VideoCard: React.FC<VideoCardProps> = ({ result, searchQuery }) => {
  const startTime = Math.floor(result.timestamp);
  // Direct YouTube timestamp link
  const videoUrl = `https://www.youtube.com/watch?v=${result.youtubeId}&t=${startTime}s`;

  // Highlight the matched keyword (or synonym) in the snippet
  const getHighlightedText = (text: string, highlight: string) => {
    if (!highlight) return <span>{text}</span>;
    
    // Escape regex characters
    const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escapedHighlight})`, 'gi'));
    
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? (
            <span key={i} className="bg-teal-100 text-teal-800 font-bold px-1 rounded border-b-2 border-teal-200">{part}</span>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  // Determine which term to highlight: the actual matched term from search, or the original query
  const highlightTerm = result.matchedTerm || searchQuery;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col md:flex-row group">
      {/* Thumbnail Link Section */}
      <a 
        href={videoUrl}
        target="_blank"
        rel="noreferrer"
        className="w-full md:w-2/5 relative aspect-video block overflow-hidden bg-gray-900 group/thumb"
        aria-label={`在 YouTube 觀看 ${result.title}，從 ${formatTime(startTime)} 開始`}
      >
        <img 
          src={`https://img.youtube.com/vi/${result.youtubeId}/hqdefault.jpg`} 
          alt={result.title}
          className="w-full h-full object-cover opacity-90 group-hover/thumb:opacity-100 group-hover/thumb:scale-105 transition-all duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${result.youtubeId}/mqdefault.jpg`;
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-300">
          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
             <PlayCircle className="w-10 h-10 text-white" fill="currentColor" />
          </div>
        </div>
        {/* Timestamp Badge */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded font-mono">
          {formatTime(startTime)}
        </div>
      </a>

      {/* Content Section */}
      <div className="p-5 flex flex-col justify-between flex-1">
        <div>
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-teal-700 transition-colors">
              <a href={videoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:underline decoration-teal-500/50">
                {result.title}
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
            </h3>
          </div>
          
          <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                <Clock className="w-3.5 h-3.5" />
                <span>{result.date}</span>
            </div>
            <span className="text-teal-600 font-medium">疾管署記者會</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border-l-4 border-teal-500 relative">
            <div className="absolute -left-1 top-4 w-2 h-2 bg-white rounded-full border-2 border-teal-500"></div>
            <p className="text-gray-700 text-base leading-relaxed pl-2">
              ...{getHighlightedText(result.transcriptSnippet, highlightTerm)}...
            </p>
          </div>
          
          <div className="mt-4 flex items-center justify-end">
            <a 
               href={videoUrl}
               target="_blank"
               rel="noreferrer"
               className="text-sm font-medium text-teal-600 hover:text-teal-800 flex items-center gap-1 transition-colors"
            >
              <PlayCircle className="w-4 h-4" />
              跳轉至 {formatTime(startTime)} 觀看手語
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

function formatTime(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

export default VideoCard;
