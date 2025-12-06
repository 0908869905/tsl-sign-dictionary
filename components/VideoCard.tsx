
import React, { useState, useRef, useEffect } from 'react';
import { VideoResult } from '../types';
import { Clock, PlayCircle, Youtube, Link as LinkIcon, Check, Star, Gauge, Repeat, ZoomIn } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { DURATION_SECONDS } from '../constants';

// Add type definition for window.YT
declare global {
  interface Window {
    YT: any;
  }
}

interface VideoCardProps {
  result: VideoResult;
  searchQuery: string;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ result, searchQuery, isBookmarked = false, onToggleBookmark }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(1.0);
  const [isLooping, setIsLooping] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  
  const playerRef = useRef<any>(null);
  const isLoopingRef = useRef(isLooping); // Ref to track loop state without re-triggering effect
  const containerId = `youtube-player-${result.id}`;
  const { t } = useLanguage();
  
  // Start 2 seconds early for context
  const startTime = Math.max(0, Math.floor(result.timestamp) - 2);
  const loopEndTime = startTime + DURATION_SECONDS; 
  const videoUrl = `https://www.youtube.com/watch?v=${result.youtubeId}&t=${startTime}s`;

  // Sync isLooping state to ref
  useEffect(() => {
    isLoopingRef.current = isLooping;
  }, [isLooping]);

  // Initialize YouTube Player & Loop Logic
  useEffect(() => {
    let interval: any;
    let loopInterval: any;

    if (isPlaying) {
      const initPlayer = () => {
        if (window.YT && window.YT.Player) {
          // Destroy existing instance if any
          if (playerRef.current) {
            try { playerRef.current.destroy(); } catch (e) {}
          }

          playerRef.current = new window.YT.Player(containerId, {
            height: '100%',
            width: '100%',
            videoId: result.youtubeId,
            playerVars: {
              start: startTime,
              autoplay: 1,
              rel: 0,
              modestbranding: 1,
            },
            events: {
              onReady: (event: any) => {
                event.target.setPlaybackRate(currentSpeed);
              },
            },
          });
        }
      };

      if (!window.YT) {
        // Load API if not available
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
        
        interval = setInterval(() => {
          if (window.YT && window.YT.Player) {
            clearInterval(interval);
            initPlayer();
          }
        }, 300);
      } else {
        initPlayer();
      }

      // Loop monitor
      loopInterval = setInterval(() => {
         // Check ref instead of state to avoid effect re-run
         if (isLoopingRef.current && playerRef.current && playerRef.current.getCurrentTime) {
            const currentTime = playerRef.current.getCurrentTime();
            if (currentTime > loopEndTime) {
               playerRef.current.seekTo(startTime);
            }
         }
      }, 500);

    } else {
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (e) {}
        playerRef.current = null;
      }
    }

    return () => {
      if (interval) clearInterval(interval);
      if (loopInterval) clearInterval(loopInterval);
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (e) {}
        playerRef.current = null;
      }
    };
  }, [isPlaying, result.youtubeId, startTime, containerId]); // Removed isLooping from deps

  // Handle Playback Speed Change
  const handleSpeedChange = (speed: number) => {
    if (playerRef.current && playerRef.current.setPlaybackRate) {
      playerRef.current.setPlaybackRate(speed);
      setCurrentSpeed(speed);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(videoUrl).then(() => {
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    });
  };

  // Highlight the matched keyword (or synonym) in the snippet
  const getHighlightedText = (text: string, highlight: string) => {
    if (!highlight) return <span>{text}</span>;
    const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escapedHighlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? (
            <span key={i} className="bg-teal-100 text-teal-800 font-bold px-1 rounded border-b-2 border-teal-200">{part}</span>
          ) : part
        )}
      </span>
    );
  };

  const highlightTerm = result.matchedTerm || searchQuery;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col group relative">
      
      {/* Video Player / Thumbnail Section */}
      <div className={`w-full aspect-video bg-gray-900 relative group/video overflow-hidden transition-all duration-300 ${isZoomed ? 'scale-105 origin-center' : ''}`}>
        {isZoomed && <div className="absolute inset-0 z-10 pointer-events-none border-[10px] border-teal-500/20" />}
        
        {isPlaying ? (
          <div className={`w-full h-full transition-transform duration-300 ${isZoomed ? 'scale-125' : ''}`}>
            <div id={containerId} className="w-full h-full" />
            
            {/* Speed & Tool Controls Overlay */}
            <div className="absolute top-2 right-2 z-20 opacity-0 group-hover/video:opacity-100 transition-opacity duration-200 flex flex-col gap-2 items-end">
               {/* Speed */}
               <div className="bg-black/70 backdrop-blur-md rounded-lg p-1.5 flex items-center gap-1 border border-white/10 shadow-lg">
                  <div className="text-white/80 px-1.5 flex items-center gap-1.5 border-r border-white/20 mr-1">
                    <Gauge className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">{t('speed')}</span>
                  </div>
                  {[0.5, 1, 1.5, 2].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => handleSpeedChange(speed)}
                      className={`text-xs font-medium px-2 py-1 rounded transition-colors ${
                        currentSpeed === speed 
                          ? 'bg-teal-600 text-white shadow-sm' 
                          : 'text-gray-300 hover:text-white hover:bg-white/20'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
               </div>

               {/* Loop & Zoom Tools */}
               <div className="flex gap-2">
                 <button 
                   onClick={() => setIsLooping(!isLooping)}
                   className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium backdrop-blur-md border border-white/10 shadow-lg transition-colors ${
                     isLooping ? 'bg-teal-600/90 text-white' : 'bg-black/70 text-gray-300 hover:text-white'
                   }`}
                   title={t('loop')}
                 >
                   <Repeat className="w-3.5 h-3.5" />
                   {t('loop')}
                 </button>
                 <button 
                   onClick={() => setIsZoomed(!isZoomed)}
                   className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium backdrop-blur-md border border-white/10 shadow-lg transition-colors ${
                     isZoomed ? 'bg-teal-600/90 text-white' : 'bg-black/70 text-gray-300 hover:text-white'
                   }`}
                   title={t('zoom')}
                 >
                   <ZoomIn className="w-3.5 h-3.5" />
                   {t('zoom')}
                 </button>
               </div>
            </div>
          </div>
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
              {t('startFrom', { time: formatTime(startTime) })}
            </div>
          </button>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col justify-between flex-1 relative">
        {onToggleBookmark && (
          <button 
            onClick={onToggleBookmark}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 transition-colors z-10 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            title={isBookmarked ? "Remove Bookmark" : "Add to Vocabulary"}
          >
            <Star className={`w-6 h-6 ${isBookmarked ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`} />
          </button>
        )}

        <div>
          <div className="flex items-start justify-between mb-2 pr-10">
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
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${result.category === 'daily' ? 'bg-orange-100 text-orange-700' : 'bg-teal-50 text-teal-600'}`}>
              {result.category === 'daily' ? t('daily') : t('medical')}
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border-l-4 border-teal-500 relative mb-2">
            <p className="text-gray-700 text-base leading-relaxed pl-1">
              ...{getHighlightedText(result.transcriptSnippet, highlightTerm)}...
            </p>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-100">
           <div className="flex gap-2">
             <button 
               onClick={() => setIsPlaying(!isPlaying)}
               className="text-sm font-medium text-gray-600 hover:text-teal-600 flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-md hover:bg-teal-50"
             >
               {isPlaying ? (
                 <>
                   <Clock className="w-4 h-4" />
                   {t('showThumb')}
                 </>
               ) : (
                 <>
                   <PlayCircle className="w-4 h-4" />
                   {t('playHere')}
                 </>
               )}
             </button>

             <button 
               onClick={handleCopyLink}
               className="text-sm font-medium text-gray-500 hover:text-blue-600 flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-md hover:bg-blue-50 relative"
               title={t('copyLink')}
             >
               {showCopied ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
               {showCopied ? t('copied') : t('copyLink')}
             </button>
           </div>

           <a 
               href={videoUrl}
               target="_blank"
               rel="noreferrer"
               className="text-sm font-medium text-gray-500 hover:text-red-600 flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-md hover:bg-red-50"
            >
              <Youtube className="w-4 h-4" />
              {t('watchOnYoutube')}
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
