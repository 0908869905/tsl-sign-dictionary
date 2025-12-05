
import React, { useState } from 'react';
import { VideoResult } from '../types';
import { ExternalLink, Clock, PlayCircle, Youtube } from 'lucide-react';

interface VideoCardProps {
  result: VideoResult;
  searchQuery: string;
}

const VideoCard: React.FC<VideoCardProps> = ({ result, searchQuery }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Start 2 seconds early for context
  const startTime = Math.max(0, Math.floor(result.timestamp) - 2);
  const videoUrl = `https://www.youtube.com/watch?v=${result.youtubeId}&t=${startTime}s`;
  const embedUrl = `https://www.youtube.com/embed/${result.youtubeId}?start=${startTime}&autoplay=1&rel=0`;

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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col group">
      {/* Video Player / Thumbnail Section */}
      <div className="w-full aspect-video bg-gray-900 relative">
        {isPlaying ? (
          <iframe
            src={embedUrl}
            title={result.title}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : (
          <button 
            onClick={() => setIsPlaying(true)}
            className="w-full h-full relative block group/thumb cursor-pointer text-left"
            aria-label={`播放 ${result.title}`}
          >
            <img 
              src={`https://img.youtube.com/vi/${result.youtubeId}/hqdefault.jpg`} 
              alt={result.title}
              className="w-full h-full object-cover opacity-90 group-hover/thumb:opacity-100 transition-all duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${result.youtubeId}/mqdefault.jpg`;
              }}
            />
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/20 backdrop-blur-md p-4 rounded-full group-hover/thumb:scale-110 transition-transform duration-300 border border-white/30 shadow-lg">
                 <PlayCircle className="w-12 h-12 text-white fill-teal-600/80" />
              </div>
            </div>
            {/* Timestamp Badge */}
            <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs px-2 py-1 rounded font-mono border border-white/10">
              從 {formatTime(startTime)} 開始
            </div>
          </button>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col justify-between flex-1">
        <div>
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
              <a href={videoUrl} target="_blank" rel="noreferrer" className="hover:text-teal-700 hover:underline decoration-teal-500/50 transition-colors">
                {result.title}
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

          <div className="p-4 bg-slate-50 rounded-lg border-l-4 border-teal-500 relative mb-2">
            <p className="text-gray-700 text-base leading-relaxed pl-1">
              ...{getHighlightedText(result.transcriptSnippet, highlightTerm)}...
            </p>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-100">
           <button 
             onClick={() => setIsPlaying(!isPlaying)}
             className="text-sm font-medium text-gray-600 hover:text-teal-600 flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-md hover:bg-teal-50"
           >
             {isPlaying ? (
               <>
                 <Clock className="w-4 h-4" />
                 顯示縮圖
               </>
             ) : (
               <>
                 <PlayCircle className="w-4 h-4" />
                 在此播放
               </>
             )}
           </button>

           <a 
               href={videoUrl}
               target="_blank"
               rel="noreferrer"
               className="text-sm font-medium text-gray-500 hover:text-red-600 flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-md hover:bg-red-50"
            >
              <Youtube className="w-4 h-4" />
              去 YouTube 看
            </a>
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