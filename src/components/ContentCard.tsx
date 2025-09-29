import { useEffect, useState } from 'react';
import { Heart, Bookmark, Share, Play, Pause } from 'lucide-react';
import { useContentStore, ContentItem } from '@/store/contentStore';
import { VideoScriptDisplay } from './VideoScriptDisplay';
import { TextSnippetDisplay } from './TextSnippetDisplay';
import ActionButton from './ActionButton';
import { toast } from 'sonner';
import { awardXp } from '@/services/xpService';
import { useXpStore } from '@/store/xpStore';

interface ContentCardProps {
  content: ContentItem;
  isActive: boolean;
  onNext: () => void;
  onPrevious: () => void;
}


/**
 * ContentCard displays a single piece of content in the feed, including code, video, or text.
 * Handles play/pause, progress, and user interactions (like, bookmark, share).
 */
export function ContentCard({ content, isActive, onNext, onPrevious }: ContentCardProps) {
  const [progress, setProgress] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const { markContentConsumed, userConsumption, updateContentInteraction } = useContentStore();
  const { setXpLevel } = useXpStore();

  // Find user interaction for this content
  const userContent = userConsumption.find((uc) => uc.content_id === content.id);
  const isLiked = userContent?.liked || false;
  const isSaved = userContent?.bookmarked || false;
  const isShared = userContent?.shared || false;

  useEffect(() => {
    if (isActive) {
      setIsPlaying(true); // Always start playing when active
    } else {
      setIsPlaying(false);
    }
  }, [isActive]);

  useEffect(() => {
    if (!isActive || !isPlaying) return;
    let newTime = 0;
    const timer = setInterval(() => {
      newTime += 1;
      setTimeSpent(newTime);
      const duration = content.estimated_duration || 60;
      const progressPercentage = Math.min((newTime / duration) * 100, 100);
      setProgress(progressPercentage);
      if (progressPercentage >= 95) {
        markContentConsumed(content.id, 100);
        awardXp('complete').then(r => { if (r) setXpLevel(r.xp, r.level, r.leveledUp); }).catch(() => {});
        setTimeout(() => {
          onNext();
        }, 1000);
        clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isActive, isPlaying, content.estimated_duration, content.id]);

  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleLike = async () => {
    await updateContentInteraction(content.id, 'liked', !isLiked);
    toast.success(!isLiked ? 'Added to likes' : 'Removed from likes');
    awardXp('like').then(r => { if (r) setXpLevel(r.xp, r.level, r.leveledUp); }).catch(() => {});
  };

  const handleSave = async () => {
    await updateContentInteraction(content.id, 'bookmarked', !isSaved);
    toast.success(!isSaved ? 'Saved for later' : 'Removed from saved');
    awardXp('bookmark').then(r => { if (r) setXpLevel(r.xp, r.level, r.leveledUp); }).catch(() => {});
  };

  const handleShare = async () => {
    await updateContentInteraction(content.id, 'shared', true);
    toast.success('Content shared!');
    awardXp('share').then(r => { if (r) setXpLevel(r.xp, r.level, r.leveledUp); }).catch(() => {});
  };

  const handleTap = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const tapX = e.clientX - rect.left;
    const screenWidth = rect.width;

    if (tapX < screenWidth / 3) {
      // Left third - previous
      onPrevious();
    } else if (tapX > (screenWidth * 2) / 3) {
      // Right third - next
      onNext();
    } else {
      // Middle third - play/pause
      togglePlayPause();
    }
  };

  return (
  <div className="relative w-full h-full bg-gradient-to-b from-black/80 to-black/60 overflow-hidden select-none" onClick={handleTap}>
      {/* Play/Pause indicator */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/20">
          <Play className="w-16 h-16 text-white/80" fill="white" />
        </div>
      )}

      {/* Main Content Display */}
  <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
        {content.content_type === 'video_script' && (
          <VideoScriptDisplay content={content} isPlaying={isPlaying} />
        )}
        {content.content_type === 'text_snippet' && (
          <TextSnippetDisplay content={content} isPlaying={isPlaying} />
        )}
        {/* Fallback for unknown types */}
        {content.content_type !== 'video_script' && content.content_type !== 'text_snippet' && (
          <div className="text-white/80 text-base">{content.content}</div>
        )}
      </div>

      {/* Progress indicator - mobile optimized positioning */}
      <div className="absolute bottom-20 sm:bottom-24 md:bottom-28 left-4 right-4 z-30">
        <div className="h-0.5 sm:h-1 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Instagram-style UI elements - mobile optimized */}
      <div className="absolute right-2 sm:right-4 bottom-28 sm:bottom-36 md:bottom-40 z-30 flex flex-col gap-3 sm:gap-4">
        <div className="scale-90 sm:scale-100">
          <ActionButton 
            icon={Heart} 
            isActive={isLiked}
            onClick={handleLike}
          />
        </div>
        <div className="scale-90 sm:scale-100">
          <ActionButton 
            icon={Bookmark} 
            isActive={isSaved}
            onClick={handleSave}
          />
        </div>
        <div className="scale-90 sm:scale-100">
          <ActionButton 
            icon={Share} 
            isActive={isShared}
            onClick={handleShare}
          />
        </div>
      </div>

      {/* Content info - mobile-first responsive design with safe area */}
      <div className="absolute bottom-8 sm:bottom-12 md:bottom-16 left-4 right-16 sm:right-20 md:right-24 z-30 text-white pb-safe">
        <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-2 line-clamp-2 leading-tight">
          {content.title.replace(/\s*\(Generated\s*\d+\)/gi, '')}
        </h3>
        <div className="flex flex-wrap gap-1.5 text-white/70">
          <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-medium">
            {content.subject.toUpperCase()}
          </span>
          <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-medium">
            {content.difficulty_level.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}