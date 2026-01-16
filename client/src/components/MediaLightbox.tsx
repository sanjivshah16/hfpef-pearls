import { useEffect, useState, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import type { TweetMedia } from '@/types/tweet';
import { cn } from '@/lib/utils';

interface MediaLightboxProps {
  media: TweetMedia[] | null;
  initialIndex: number;
  onClose: () => void;
}

export function MediaLightbox({ media, initialIndex, onClose }: MediaLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!media) return;
      
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev + 1) % media.length);
      }
    },
    [media, onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  if (!media || media.length === 0) return null;

  const currentMedia = media[currentIndex];
  const hasMultiple = media.length > 1;

  const getMediaUrl = () => {
    if (currentMedia.local_path) {
      return `/${currentMedia.local_path}`;
    }
    if (currentMedia.type === 'photo') {
      return currentMedia.media_url;
    }
    return currentMedia.video_url || currentMedia.media_url;
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-10"
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Download button */}
      <a
        href={getMediaUrl()}
        download
        onClick={(e) => e.stopPropagation()}
        className="absolute top-4 right-16 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-10"
        aria-label="Download"
      >
        <Download className="w-6 h-6" />
      </a>

      {/* Navigation buttons */}
      {hasMultiple && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors z-10"
            aria-label="Previous"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev + 1) % media.length);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors z-10"
            aria-label="Next"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}

      {/* Media content */}
      <div
        className="max-w-[90vw] max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {currentMedia.type === 'photo' ? (
          <img
            src={getMediaUrl()}
            alt="Full size media"
            className="max-w-full max-h-[90vh] object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src !== currentMedia.media_url) {
                target.src = currentMedia.media_url;
              }
            }}
          />
        ) : (
          <video
            src={getMediaUrl()}
            controls
            autoPlay
            className="max-w-full max-h-[90vh]"
          >
            Your browser does not support video playback.
          </video>
        )}
      </div>

      {/* Media counter */}
      {hasMultiple && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {media.map((_: TweetMedia, idx: number) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className={cn(
                'w-2.5 h-2.5 rounded-full transition-colors',
                idx === currentIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/60'
              )}
              aria-label={`Go to media ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
