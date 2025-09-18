import { useState, useEffect, useRef } from "react";
import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ReelsVideoCard from "./ReelsVideoCard";
import ReelsTextCard from "./ReelsTextCard";
import BottomNavigation from "./BottomNavigation";
import ContentGenerator from "./ContentGenerator";

interface ContentItem {
  id: string;
  type: 'video' | 'text';
  title: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  likes: number;
  comments?: number;
  shares?: number;
  isBookmarked: boolean;
  // Video specific
  thumbnail?: string;
  duration?: number;
  videoUrl?: string;
  // Text specific
  preview?: string;
  readTime?: number;
  // Common
  author?: {
    name: string;
    avatar?: string;
  };
  tags?: string[];
  progress?: number;
}

interface ReelsContainerProps {
  mode: 'video' | 'text';
  onModeChange: (mode: 'video' | 'text') => void;
  selectedCategory: string;
}

// Enhanced mock data with more realistic content
const mockContent: ContentItem[] = [
  {
    id: '1',
    type: 'video',
    title: 'Python List Comprehensions Explained',
    category: 'python',
    difficulty: 'beginner',
    likes: 1234,
    comments: 89,
    shares: 45,
    isBookmarked: false,
    thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=600&fit=crop',
    duration: 75,
    author: { name: 'PythonPro', avatar: '' },
    tags: ['python', 'tutorial', 'basics'],
    progress: 65,
  },
  {
    id: '2',
    type: 'text',
    title: 'JavaScript Closures Deep Dive',
    category: 'javascript',
    difficulty: 'intermediate',
    likes: 892,
    comments: 156,
    shares: 67,
    isBookmarked: true,
    preview: `function outerFunction(x) {
  return function innerFunction(y) {
    return x + y;
  };
}

const closure = outerFunction(10);
console.log(closure(5)); // 15

// The inner function has access to 
// the outer function's variables
// even after the outer function returns`,
    readTime: 3,
    author: { name: 'JSMaster', avatar: '' },
    tags: ['javascript', 'closures', 'advanced'],
    progress: 80,
  },
  {
    id: '3',
    type: 'video',
    title: 'React Hooks in 60 Seconds',
    category: 'react',
    difficulty: 'intermediate',
    likes: 2156,
    comments: 234,
    shares: 123,
    isBookmarked: false,
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=600&fit=crop',
    duration: 85,
    author: { name: 'ReactDev', avatar: '' },
    tags: ['react', 'hooks', 'modern'],
    progress: 45,
  },
  {
    id: '4',
    type: 'text',
    title: 'TypeScript Generics Made Simple',
    category: 'typescript',
    difficulty: 'advanced',
    likes: 756,
    comments: 89,
    shares: 34,
    isBookmarked: false,
    preview: `function identity<T>(arg: T): T {
  return arg;
}

// Usage examples
let stringOutput = identity<string>("Hello");
let numberOutput = identity<number>(42);

// Type inference works too!
let autoString = identity("World"); // T is string
let autoNumber = identity(123);     // T is number`,
    readTime: 4,
    author: { name: 'TypeScript Guru', avatar: '' },
    tags: ['typescript', 'generics', 'advanced'],
    progress: 20,
  },
];

const ReelsContainer = ({ mode, onModeChange, selectedCategory }: ReelsContainerProps) => {
  const [content, setContent] = useState<ContentItem[]>(mockContent);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('home');
  const [startY, setStartY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter content based on mode and category
  const filteredContent = content.filter(item => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) {
      return false;
    }
    return item.type === mode;
  });

  // Auto-play logic with intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          const video = entry.target.querySelector('video');
          if (entry.isIntersecting) {
            setCurrentIndex(index);
            if (video) {
              video.play().catch(() => {});
            }
          } else {
            if (video) {
              video.pause();
            }
          }
        });
      },
      { threshold: 0.7 }
    );

    const videoCards = document.querySelectorAll('.video-card');
    videoCards.forEach(card => observer.observe(card));

    return () => observer.disconnect();
  }, [filteredContent]);

  // Touch handlers for swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endY = e.changedTouches[0].clientY;
    const diff = startY - endY;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIndex < filteredContent.length - 1) {
        // Swipe up - next video
        const nextCard = document.querySelectorAll('.video-card')[currentIndex + 1];
        nextCard?.scrollIntoView({ behavior: 'smooth' });
      } else if (diff < 0 && currentIndex > 0) {
        // Swipe down - previous video
        const prevCard = document.querySelectorAll('.video-card')[currentIndex - 1];
        prevCard?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleLike = (id: string) => {
    setContent(prev => prev.map(item => 
      item.id === id 
        ? { ...item, likes: item.likes + 1 }
        : item
    ));
  };

  const handleBookmark = (id: string) => {
    setContent(prev => prev.map(item => 
      item.id === id 
        ? { ...item, isBookmarked: !item.isBookmarked }
        : item
    ));
  };

  const handleShare = (id: string) => {
    // TODO: Implement share functionality
    console.log('Sharing content:', id);
  };

  const handleContentGenerated = (newContent: any) => {
    const formattedContent: ContentItem = {
      id: newContent.id,
      type: newContent.type,
      title: newContent.title,
      category: newContent.category,
      difficulty: newContent.difficulty,
      likes: newContent.likes || 0,
      comments: 0,
      shares: 0,
      isBookmarked: false,
      thumbnail: newContent.thumbnail,
      duration: newContent.duration,
      preview: newContent.preview || newContent.explanation || newContent.code_example,
      readTime: newContent.readTime || newContent.estimated_read_time,
      author: { name: 'CodeSnap AI', avatar: '' },
      tags: [newContent.category, newContent.difficulty],
      progress: 0,
    };
    
    setContent(prev => [formattedContent, ...prev]);
  };

  return (
    <div className="h-screen w-screen bg-black overflow-hidden relative">
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-50 flex justify-between items-center p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-white font-bold text-lg">CodeSnap</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
            <Search className="h-5 w-5" />
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground">U</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-black/50 backdrop-blur-sm rounded-full p-1 flex">
          <Button 
            variant={mode === 'video' ? 'default' : 'ghost'}
            size="sm"
            className={`rounded-full ${mode === 'video' ? 'bg-white text-black' : 'text-white hover:bg-white/10'}`}
            onClick={() => onModeChange('video')}
          >
            Video
          </Button>
          <Button 
            variant={mode === 'text' ? 'default' : 'ghost'}
            size="sm" 
            className={`rounded-full ${mode === 'text' ? 'bg-white text-black' : 'text-white hover:bg-white/10'}`}
            onClick={() => onModeChange('text')}
          >
            Text
          </Button>
        </div>
      </div>

      {/* Content Generator (floating) */}
      <div className="absolute top-24 right-4 z-40">
        <ContentGenerator 
          mode={mode} 
          onContentGenerated={handleContentGenerated}
        />
      </div>

      {/* Main Feed Container */}
      <div 
        ref={containerRef}
        className="h-full w-full overflow-hidden relative snap-container"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="snap-y snap-mandatory h-full overflow-y-scroll scrollbar-hide">
          {filteredContent.length === 0 ? (
            <div className="h-screen flex items-center justify-center text-white">
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold">No {mode} content</h2>
                <p className="text-gray-400">Try switching categories or generating new content</p>
              </div>
            </div>
          ) : (
            filteredContent.map((item, index) => (
              mode === 'video' ? (
                <ReelsVideoCard
                  key={item.id}
                  content={item as any}
                  isActive={currentIndex === index}
                  onLike={handleLike}
                  onBookmark={handleBookmark}
                  onShare={handleShare}
                />
              ) : (
                <ReelsTextCard
                  key={item.id}
                  content={item as any}
                  isActive={currentIndex === index}
                  onLike={handleLike}
                  onBookmark={handleBookmark}
                  onShare={handleShare}
                />
              )
            ))
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};

export default ReelsContainer;