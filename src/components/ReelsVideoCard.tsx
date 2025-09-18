import { useState, useRef } from "react";
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal, Play, Pause } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ActionButton from "./ActionButton";
import { motion } from "framer-motion";

interface VideoContentItem {
  id: string;
  type: 'video';
  title: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  likes: number;
  comments?: number;
  shares?: number;
  isBookmarked: boolean;
  thumbnail: string;
  duration: number;
  videoUrl?: string;
  author?: {
    name: string;
    avatar?: string;
  };
  tags?: string[];
  progress?: number;
}

interface ReelsVideoCardProps {
  content: VideoContentItem;
  isActive: boolean;
  onLike: (id: string) => void;
  onBookmark: (id: string) => void;
  onShare: (id: string) => void;
}

const ReelsVideoCard = ({ 
  content, 
  isActive, 
  onLike, 
  onBookmark, 
  onShare 
}: ReelsVideoCardProps) => {
  const [showHearts, setShowHearts] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const handleDoubleTap = () => {
    onLike(content.id);
    setShowHearts(true);
    setTimeout(() => setShowHearts(false), 1000);
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/20 text-green-400 border-green-400';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-400';
      case 'advanced': return 'bg-red-500/20 text-red-400 border-red-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div 
      className="snap-start h-screen w-full relative flex items-center justify-center bg-black video-card"
      onDoubleClick={handleDoubleTap}
    >
      {/* Video Background */}
      <div className="absolute inset-0 z-10">
        {content.videoUrl ? (
          <video 
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay={isActive}
            loop
            muted
            playsInline
            poster={content.thumbnail}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            <source src={content.videoUrl} type="video/mp4" />
          </video>
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
            <div 
              className="w-full h-full bg-cover bg-center relative"
              style={{ backgroundImage: `url(${content.thumbnail})` }}
            >
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Play className="h-8 w-8 text-white ml-1" />
                  </div>
                  <p className="text-white text-lg font-medium">Video Preview</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Category Badge - Top Left */}
      <div className="absolute top-20 left-4 z-30">
        <Badge className={`category-${content.category} text-xs font-medium`}>
          {content.category.toUpperCase()}
        </Badge>
      </div>

      {/* Duration Badge - Top Right */}
      <div className="absolute top-20 right-4 z-30 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md">
        {formatDuration(content.duration)}
      </div>

      {/* Play/Pause Button - Center */}
      {!isActive && (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <Button
            size="lg"
            onClick={togglePlayPause}
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full w-16 h-16 border-2 border-white/30"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white ml-1" />
            )}
          </Button>
        </div>
      )}

      {/* Right Side Actions */}
      <div className="absolute right-4 bottom-24 z-30 flex flex-col gap-4">
        <ActionButton 
          icon={Heart} 
          count={content.likes} 
          onClick={() => onLike(content.id)}
        />
        <ActionButton 
          icon={MessageCircle} 
          count={content.comments || 0}
        />
        <ActionButton 
          icon={Share} 
          onClick={() => onShare(content.id)}
        />
        <ActionButton 
          icon={Bookmark} 
          onClick={() => onBookmark(content.id)}
          isActive={content.isBookmarked}
        />
        <ActionButton icon={MoreHorizontal} />
      </div>

      {/* Bottom Info Panel */}
      <div className="absolute bottom-0 left-0 right-0 z-30 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-start justify-between">
          <div className="flex-1 mr-16">
            <div className="flex items-center gap-2 mb-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={content.author?.avatar} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {content.author?.name?.charAt(0) || 'C'}
                </AvatarFallback>
              </Avatar>
              <span className="text-white font-medium">
                {content.author?.name || 'CodeSnap'}
              </span>
              <Button variant="outline" size="sm" className="text-white border-white/30 hover:bg-white/10">
                Follow
              </Button>
            </div>
            
            <h3 className="text-white text-lg font-semibold mb-1">{content.title}</h3>
            
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getDifficultyColor(content.difficulty)}>
                {content.difficulty}
              </Badge>
            </div>
            
            {/* Tags */}
            {content.tags && (
              <div className="flex flex-wrap gap-1 mt-2">
                {content.tags.map(tag => (
                  <span key={tag} className="text-blue-400 text-sm">#{tag}</span>
                ))}
              </div>
            )}

            {/* Progress Bar */}
            {content.progress && (
              <div className="flex items-center gap-2 mt-3">
                <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${content.progress}%` }}
                  />
                </div>
                <span className="text-gray-400 text-xs">
                  {Math.round(content.progress)}% complete
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Double-tap Hearts Animation */}
      {showHearts && (
        <motion.div
          className="absolute inset-0 pointer-events-none flex items-center justify-center z-40"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
        >
          <motion.div
            animate={{ 
              y: [-20, -100], 
              opacity: [1, 0],
              scale: [1, 1.5]
            }}
            transition={{ duration: 1 }}
          >
            <Heart className="h-16 w-16 text-red-500 fill-red-500" />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ReelsVideoCard;