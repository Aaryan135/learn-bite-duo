import { useState } from "react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ActionButton from "./ActionButton";
import { motion } from "framer-motion";

interface ContentItem {
  id: string;
  type: 'text';
  title: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  likes: number;
  comments?: number;
  shares?: number;
  isBookmarked: boolean;
  preview: string;
  readTime: number;
  author?: {
    name: string;
    avatar?: string;
  };
  tags?: string[];
  progress?: number;
}

interface ReelsTextCardProps {
  content: ContentItem;
  isActive: boolean;
  onLike: (id: string) => void;
  onBookmark: (id: string) => void;
  onShare: (id: string) => void;
}

const ReelsTextCard = ({ 
  content, 
  isActive, 
  onLike, 
  onBookmark, 
  onShare 
}: ReelsTextCardProps) => {
  const [showHearts, setShowHearts] = useState(false);
  
  const handleDoubleTap = () => {
    onLike(content.id);
    setShowHearts(true);
    setTimeout(() => setShowHearts(false), 1000);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/20 text-green-400 border-green-400';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-400';
      case 'advanced': return 'bg-red-500/20 text-red-400 border-red-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const detectLanguage = (code: string) => {
    if (code.includes('function') && code.includes('{')) return 'javascript';
    if (code.includes('def ') && code.includes(':')) return 'python';
    if (code.includes('#include') || code.includes('std::')) return 'cpp';
    if (code.includes('public class') || code.includes('System.out')) return 'java';
    return 'javascript';
  };

  return (
    <div 
      className="snap-start h-screen w-full relative flex items-center justify-center bg-gradient-to-b from-background to-background/90 video-card"
      onDoubleClick={handleDoubleTap}
    >
      {/* Main Content */}
      <div className="w-full h-full flex items-center justify-center p-6 relative z-10">
        <div className="max-w-sm w-full space-y-4">
          {/* Category Badge */}
          <div className="flex justify-center">
            <Badge className={`category-${content.category} text-xs font-medium`}>
              {content.category.toUpperCase()}
            </Badge>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-foreground mb-6">
            {content.title}
          </h2>

          {/* Code Block */}
          <div className="rounded-xl overflow-hidden shadow-2xl">
            <SyntaxHighlighter
              language={detectLanguage(content.preview)}
              style={oneDark}
              className="text-sm rounded-lg"
              customStyle={{
                margin: 0,
                padding: '20px',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(10px)',
              }}
            >
              {content.preview}
            </SyntaxHighlighter>
          </div>

          {/* Difficulty & Read Time */}
          <div className="flex justify-center gap-3">
            <Badge className={getDifficultyColor(content.difficulty)}>
              {content.difficulty}
            </Badge>
            <Badge variant="outline" className="text-muted-foreground">
              {content.readTime} min read
            </Badge>
          </div>
        </div>
      </div>

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
                  {content.author?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-white font-medium">
                {content.author?.name || 'CodeSnap'}
              </span>
              <Button variant="outline" size="sm" className="text-white border-white/30 hover:bg-white/10">
                Follow
              </Button>
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

export default ReelsTextCard;