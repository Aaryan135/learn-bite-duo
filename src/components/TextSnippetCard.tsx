import { Clock, ThumbsUp, Bookmark, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TextSnippetCardProps {
  id: string;
  title: string;
  preview: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  readTime: number;
  likes: number;
  isBookmarked: boolean;
  onRead: (id: string) => void;
  onBookmark: (id: string) => void;
}

const TextSnippetCard = ({
  id,
  title,
  preview,
  category,
  difficulty,
  readTime,
  likes,
  isBookmarked,
  onRead,
  onBookmark
}: TextSnippetCardProps) => {
  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'beginner': return 'text-success';
      case 'intermediate': return 'text-warning';
      case 'advanced': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div 
      className="feed-item glass rounded-xl p-6 cursor-pointer"
      onClick={() => onRead(id)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Badge className={`category-${category} text-xs font-medium`}>
            {category.toUpperCase()}
          </Badge>
          <span className={`text-xs font-medium ${getDifficultyColor(difficulty)}`}>
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onBookmark(id);
          }}
          className={`p-2 ${isBookmarked ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
        </Button>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-foreground text-lg mb-3 line-clamp-2">
        {title}
      </h3>

      {/* Preview */}
      <div className="bg-surface rounded-lg p-4 mb-4 border border-border/30">
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
          <Code className="w-4 h-4" />
          <span>Code Preview</span>
        </div>
        <pre className="font-mono text-sm text-foreground whitespace-pre-wrap line-clamp-4 overflow-hidden">
          {preview}
        </pre>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{readTime} min read</span>
          </div>
          
          <div className="flex items-center gap-1">
            <ThumbsUp className="w-3 h-3" />
            <span>{likes}</span>
          </div>
        </div>

        <Button 
          variant="ghost" 
          size="sm"
          className="text-primary hover:text-primary-hover font-medium"
        >
          Read More →
        </Button>
      </div>
    </div>
  );
};

export default TextSnippetCard;