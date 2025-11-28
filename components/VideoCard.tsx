
import React from 'react';
import { VideoResult } from '../types';
import { ExternalLink, Clock } from 'lucide-react';

interface VideoCardProps {
  result: VideoResult;
  searchQuery: string;
}

const VideoCard: React.FC<VideoCardProps> = ({ result, searchQuery }) => {
  const startTime = Math.floor(result.timestamp);
  // Direct YouTube timestamp link
  const videoUrl = `https://www.youtube.com/watch?v=${result.youtubeId}&t=${startTime}s`;

  // Highlight the matched keyword in the snippet
  const getHighlightedText = (text: string, highlight: string) => {
    if (!highlight) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
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
              <a href={videoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2">
                {result.title}
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
            </h3>
          </div>
          
          <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{result.date}</span>
            </div>
            <span className="text-gray-300">|</span>
            <span className="text-teal-600 font-medium">疾管署記者會</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border-l-4 border-teal-500">
            <p className="text-gray-700 text-base leading-relaxed">
              " {getHighlightedText(result.transcriptSnippet, searchQuery)} "
            </p>
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
