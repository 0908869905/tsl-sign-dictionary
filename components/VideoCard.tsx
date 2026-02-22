
import React, { useState, useRef, useEffect } from 'react';
import { VideoResult } from '../types';
import { Clock, PlayCircle, Youtube, Link as LinkIcon, Check, Star, Gauge, Repeat, ZoomIn, ZoomOut } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { DURATION_SECONDS } from '../constants';

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
  const isLoopingRef = useRef(isLooping);
  const containerId = `youtube-player-${result.id}`;
  const { t } = useLanguage();

  const startTime = Math.max(0, Math.floor(result.timestamp) - 2);
  const loopEndTime = startTime + DURATION_SECONDS;
  const videoUrl = `https://www.youtube.com/watch?v=${result.youtubeId}&t=${startTime}s`;

  useEffect(() => {
    isLoopingRef.current = isLooping;
  }, [isLooping]);

  useEffect(() => {
    let interval: any;
    let loopInterval: any;

    if (isPlaying) {
      const initPlayer = () => {
        if (window.YT && window.YT.Player) {
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

      loopInterval = setInterval(() => {
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
  }, [isPlaying, result.youtubeId, startTime, containerId]);

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

  const getHighlightedText = (text: string, highlight: string) => {
    if (!highlight) return <span>{text}</span>;
    const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escapedHighlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <span key={i} className="bg-accent/10 text-accent font-semibold px-0.5">{part}</span>
          ) : part
        )}
      </span>
    );
  };

  const highlightTerm = result.matchedTerm || searchQuery;

  return (
    <div className="bg-white border border-zinc-200 rounded-md overflow-hidden group hover:border-accent transition-colors duration-300 relative">

      {/* Video Player / Thumbnail */}
      <div className="w-full aspect-video bg-zinc-100 relative group/video overflow-hidden">
        {isZoomed && <div className="absolute inset-0 z-10 pointer-events-none border-[6px] border-accent/20" />}

        {isPlaying ? (
          <>
            <div className={`w-full h-full transition-transform duration-300 ${isZoomed ? 'scale-[3] origin-right' : ''}`}>
              <div id={containerId} className="w-full h-full" />
            </div>

            {/* Controls Overlay */}
            <div className="absolute top-2 right-2 z-20 opacity-0 group-hover/video:opacity-100 transition-opacity duration-200 flex flex-col gap-2 items-end">
              <div className="bg-black/70 backdrop-blur-md rounded px-2 py-1 flex items-center gap-1 border border-white/10">
                <div className="text-white/60 px-1 flex items-center gap-1 border-r border-white/20 mr-1">
                  <Gauge className="w-3 h-3" />
                </div>
                {[0.5, 1, 1.5, 2].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => handleSpeedChange(speed)}
                    className={`text-xs px-1.5 py-0.5 rounded transition-colors ${
                      currentSpeed === speed
                        ? 'bg-accent text-white'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setIsLooping(!isLooping)}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs backdrop-blur-md border border-white/10 transition-colors ${
                    isLooping ? 'bg-accent/90 text-white' : 'bg-black/70 text-zinc-400 hover:text-white'
                  }`}
                >
                  <Repeat className="w-3 h-3" />
                  {t('loop')}
                </button>
                <button
                  onClick={() => setIsZoomed(!isZoomed)}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs backdrop-blur-md border border-white/10 transition-colors ${
                    isZoomed ? 'bg-accent/90 text-white' : 'bg-black/70 text-zinc-400 hover:text-white'
                  }`}
                >
                  {isZoomed ? <ZoomOut className="w-3 h-3" /> : <ZoomIn className="w-3 h-3" />}
                  {t('zoom')}
                </button>
              </div>
            </div>
          </>
        ) : (
          <button
            onClick={() => setIsPlaying(true)}
            className="w-full h-full relative block group/thumb cursor-pointer text-left"
            aria-label={`播放 ${result.title}`}
          >
            <img
              src={`https://img.youtube.com/vi/${result.youtubeId}/hqdefault.jpg`}
              alt={result.title}
              className="w-full h-full object-cover opacity-90 group-hover/thumb:opacity-100 transition-opacity duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${result.youtubeId}/mqdefault.jpg`;
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/90 p-3 rounded-full group-hover/thumb:scale-105 transition-transform duration-300">
                <PlayCircle className="w-8 h-8 text-accent" />
              </div>
            </div>
            <div className="absolute bottom-2 right-2 bg-zinc-900/80 text-white text-xs px-2 py-0.5 rounded font-mono">
              {formatTime(startTime)}
            </div>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-5 relative">
        {/* Bookmark */}
        {onToggleBookmark && (
          <button
            onClick={onToggleBookmark}
            className="absolute top-5 right-5 p-1.5 transition-colors z-10"
            title={isBookmarked ? "Remove Bookmark" : "Add to Vocabulary"}
          >
            <Star className={`w-5 h-5 ${isBookmarked ? 'fill-amber-400 text-amber-400' : 'text-zinc-300 hover:text-amber-400'} transition-colors`} />
          </button>
        )}

        {/* Title */}
        <h3 className="font-display text-lg font-semibold text-zinc-900 leading-snug pr-8 mb-2">
          <a href={videoUrl} target="_blank" rel="noreferrer" className="link-underline hover:text-accent transition-colors">
            {result.title}
          </a>
        </h3>

        {/* Meta */}
        <div className="flex items-center gap-3 text-sm text-zinc-400 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{result.date}</span>
          </div>
          <span className="text-xs tracking-wider uppercase">
            {result.category === 'daily' ? t('daily') : t('medical')}
          </span>
          {/* 詞典式詞性標籤 */}
          <span className="font-mono text-xs text-zinc-400 italic">
            {result.category === 'daily' ? 'n. 日常' : 'n. 醫療'}
          </span>
        </div>

        {/* Transcript Snippet */}
        <div className="pl-4 border-l-2 border-zinc-200 mb-4">
          <p className="text-zinc-600 text-base leading-[1.8] tracking-[0.02em]">
            ...{getHighlightedText(result.transcriptSnippet, highlightTerm)}...
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
          <div className="flex gap-1">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-sm text-zinc-500 hover:text-accent flex items-center gap-1.5 transition-colors px-2 py-1 rounded hover:bg-zinc-50"
            >
              {isPlaying ? (
                <><Clock className="w-3.5 h-3.5" />{t('showThumb')}</>
              ) : (
                <><PlayCircle className="w-3.5 h-3.5" />{t('playHere')}</>
              )}
            </button>
            <button
              onClick={handleCopyLink}
              className="text-sm text-zinc-500 hover:text-accent flex items-center gap-1.5 transition-colors px-2 py-1 rounded hover:bg-zinc-50"
            >
              {showCopied ? <Check className="w-3.5 h-3.5" /> : <LinkIcon className="w-3.5 h-3.5" />}
              {showCopied ? t('copied') : t('copyLink')}
            </button>
          </div>
          <a
            href={videoUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-zinc-400 hover:text-red-600 flex items-center gap-1.5 transition-colors px-2 py-1 rounded hover:bg-red-50"
          >
            <Youtube className="w-3.5 h-3.5" />
            YouTube
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
