import { useState } from "react";
import VideoCard from "./VideoCard";
import TextSnippetCard from "./TextSnippetCard";
import ContentGenerator from "./ContentGenerator";

interface ContentItem {
  id: string;
  type: 'video' | 'text';
  title: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  likes: number;
  isBookmarked: boolean;
  // Video specific
  thumbnail?: string;
  duration?: number;
  // Text specific
  preview?: string;
  readTime?: number;
}

interface ContentFeedProps {
  mode: 'video' | 'text';
  selectedCategory: string;
}

// Mock data - will be replaced with real data from backend
const mockContent: ContentItem[] = [
  {
    id: '1',
    type: 'video',
    title: 'Python List Comprehensions in 60 Seconds',
    category: 'python',
    difficulty: 'beginner',
    likes: 234,
    isBookmarked: false,
    thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=225&fit=crop',
    duration: 75,
  },
  {
    id: '2',
    type: 'text',
    title: 'Understanding JavaScript Closures',
    category: 'javascript',
    difficulty: 'intermediate',
    likes: 189,
    isBookmarked: true,
    preview: `function outerFunction(x) {
  return function innerFunction(y) {
    return x + y;
  };
}

const closure = outerFunction(10);
console.log(closure(5)); // 15`,
    readTime: 3,
  },
  {
    id: '3',
    type: 'video',
    title: 'React Hooks: useState Deep Dive',
    category: 'react',
    difficulty: 'intermediate',
    likes: 456,
    isBookmarked: false,
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=225&fit=crop',
    duration: 85,
  },
  {
    id: '4',
    type: 'text',
    title: 'TypeScript Generics Made Simple',
    category: 'typescript',
    difficulty: 'advanced',
    likes: 312,
    isBookmarked: false,
    preview: `function identity<T>(arg: T): T {
  return arg;
}

// Usage
let output = identity<string>("Hello");
let numOutput = identity<number>(42);

// Type inference
let autoOutput = identity("World");`,
    readTime: 4,
  },
  {
    id: '5',
    type: 'video',
    title: 'Java OOP Concepts Explained',
    category: 'java',
    difficulty: 'beginner',
    likes: 178,
    isBookmarked: true,
    thumbnail: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=400&h=225&fit=crop',
    duration: 90,
  },
  {
    id: '6',
    type: 'text',
    title: 'C++ Smart Pointers Guide',
    category: 'cpp',
    difficulty: 'advanced',
    likes: 267,
    isBookmarked: false,
    preview: `#include <memory>

class MyClass {
public:
    void doSomething() {
        std::cout << "Doing something..." << std::endl;
    }
};

auto ptr = std::make_unique<MyClass>();
ptr->doSomething();`,
    readTime: 5,
  },
];

const ContentFeed = ({ mode, selectedCategory }: ContentFeedProps) => {
  const [content, setContent] = useState<ContentItem[]>(mockContent);
  const [bookmarkedItems, setBookmarkedItems] = useState<Set<string>>(
    new Set(mockContent.filter(item => item.isBookmarked).map(item => item.id))
  );

  const filteredContent = content.filter(item => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) {
      return false;
    }
    return item.type === mode;
  });

  const handlePlay = (id: string) => {
    console.log('Playing video:', id);
    // TODO: Implement video playback
  };

  const handleRead = (id: string) => {
    console.log('Reading article:', id);  
    // TODO: Navigate to full article
  };

  const handleBookmark = (id: string) => {
    setBookmarkedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleContentGenerated = (newContent: any) => {
    const formattedContent: ContentItem = {
      id: newContent.id,
      type: newContent.type,
      title: newContent.title,
      category: newContent.category,
      difficulty: newContent.difficulty,
      likes: newContent.likes,
      isBookmarked: newContent.isBookmarked,
      thumbnail: newContent.thumbnail,
      duration: newContent.duration,
      preview: newContent.preview || newContent.explanation || newContent.code_example,
      readTime: newContent.readTime || newContent.estimated_read_time,
    };
    
    setContent(prev => [formattedContent, ...prev]);
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
      <ContentGenerator 
        mode={mode} 
        onContentGenerated={handleContentGenerated}
      />
      <div className="px-4 space-y-6">
        {filteredContent.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground text-lg mb-2">
              No {mode === 'video' ? 'videos' : 'articles'} found
            </div>
            <p className="text-sm text-muted-foreground">
              Try selecting a different category or check back later for new content.
            </p>
          </div>
        ) : (
          filteredContent.map((item) => (
            mode === 'video' ? (
              <VideoCard
                key={item.id}
                id={item.id}
                title={item.title}
                thumbnail={item.thumbnail || ''}
                duration={item.duration || 0}
                category={item.category}
                difficulty={item.difficulty}
                likes={item.likes}
                isBookmarked={bookmarkedItems.has(item.id)}
                onPlay={handlePlay}
                onBookmark={handleBookmark}
              />
            ) : (
              <TextSnippetCard
                key={item.id}
                id={item.id}
                title={item.title}
                preview={item.preview || ''}
                category={item.category}
                difficulty={item.difficulty}
                readTime={item.readTime || 0}
                likes={item.likes}
                isBookmarked={bookmarkedItems.has(item.id)}
                onRead={handleRead}
                onBookmark={handleBookmark}
              />
            )
          ))
        )}
      </div>
    </div>
  );
};

export default ContentFeed;