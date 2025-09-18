import { Play, Clock, ThumbsUp, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface VideoCardProps {
  id: string;
  title: string;
  thumbnail: string;
  duration: number;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  likes: number;
  isBookmarked: boolean;
  onPlay: (id: string) => void;
  onBookmark: (id: string) => void;
}

const VideoCard = ({
  id,
  title,
  thumbnail,
  duration,
  category,
  difficulty,
  likes,
  isBookmarked,
  onPlay,
  onBookmark
}: VideoCardProps) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'beginner': return 'text-success';
      case 'intermediate': return 'text-warning';
      case 'advanced': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="feed-item glass rounded-xl overflow-hidden group cursor-pointer">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-surface">
        <img 
          src={thumbnail} 
          alt={title}
          className="w-full h-full object-cover"
        />
        
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            size="lg"
            onClick={() => onPlay(id)}
            className="bg-gradient-primary hover:bg-primary-hover shadow-glow rounded-full w-16 h-16"
          >
            <Play className="w-6 h-6 ml-1" />
          </Button>
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDuration(duration)}
        </div>

        {/* Category badge */}
        <div className="absolute top-2 left-2">
          <Badge className={`category-${category} text-xs font-medium`}>
            {category.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground line-clamp-2 mb-2">
              {title}
            </h3>
            
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className={`font-medium ${getDifficultyColor(difficulty)}`}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </span>
              
              <div className="flex items-center gap-1">
                <ThumbsUp className="w-3 h-3" />
                <span>{likes}</span>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onBookmark(id)}
            className={`p-2 ${isBookmarked ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;