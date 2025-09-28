import { useState, useEffect } from 'react';
import { Search, X, Filter, Loader2, Sparkles, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useContentStore } from '@/store/contentStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContentSelect: (content: any) => void;
}

interface SearchResult {
  id: string;
  title: string;
  content: string;
  subject: string;
  difficulty_level: string;
  content_type: string;
  tags: string[];
  estimated_duration: number;
}

export function SearchModal({ isOpen, onClose, onContentSelect }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [showNoResults, setShowNoResults] = useState(false);
  const [recentlyGenerated, setRecentlyGenerated] = useState<SearchResult[]>([]);
  const { currentSubject, currentDifficulty } = useContentStore();

  // Mock search data for when database is not available
  const mockSearchData: SearchResult[] = [
    {
      id: 'search-1',
      title: 'Complete Guide to JavaScript Variables and Scope',
      content: 'Master the intricacies of JavaScript variable declarations, scope chains, and hoisting mechanisms. This comprehensive guide covers let, const, and var declarations, explores lexical scoping, temporal dead zones, and closure patterns. Learn how the JavaScript engine handles variable resolution, understand the differences between function and block scope, and discover advanced patterns for managing variable lifecycle. Includes practical examples, common pitfalls, and best practices for writing maintainable code.',
      subject: 'javascript',
      difficulty_level: 'beginner',
      content_type: 'video_script',
      tags: ['Variables', 'Scope', 'Hoisting', 'let', 'const', 'var', 'Closures', 'Temporal Dead Zone'],
      estimated_duration: 120
    },
    {
      id: 'search-2',
      title: 'Advanced React Hooks: Complete Professional Guide',
      content: 'Deep dive into React hooks ecosystem with comprehensive coverage of built-in and custom hooks. Master useState for complex state management, useEffect for side effects and cleanup, useContext for prop drilling solutions, and useReducer for complex state logic. Learn advanced patterns like useCallback and useMemo for performance optimization, explore custom hook creation, and understand the rules of hooks. Includes real-world examples, performance considerations, testing strategies, and common anti-patterns to avoid.',
      subject: 'react',
      difficulty_level: 'intermediate',
      content_type: 'text_snippet',
      tags: ['Hooks', 'useState', 'useEffect', 'Custom Hooks', 'Performance', 'useCallback', 'useMemo', 'useContext'],
      estimated_duration: 150
    },
    {
      id: 'search-3',
      title: 'Python List Comprehensions: From Basics to Advanced Patterns',
      content: 'Comprehensive exploration of Python list comprehensions, from basic syntax to advanced nested patterns. Learn how to write Pythonic code with list, dict, and set comprehensions. Understand performance implications, memory usage, and when to choose comprehensions over traditional loops. Explore advanced patterns including conditional logic, nested comprehensions, and generator expressions. Covers best practices, readability considerations, and real-world applications in data processing and algorithm implementation.',
      subject: 'python',
      difficulty_level: 'intermediate',
      content_type: 'video_script',
      tags: ['List Comprehensions', 'Pythonic Code', 'Performance', 'Generator Expressions', 'Data Processing'],
      estimated_duration: 135
    },
    {
      id: 'search-4',
      title: 'TypeScript Generics: Advanced Type System Mastery',
      content: 'Master TypeScript generics for building robust, reusable, and type-safe applications. Explore generic functions, classes, and interfaces with comprehensive examples. Learn advanced concepts including generic constraints, conditional types, mapped types, and utility types. Understand variance, type inference, and how to design flexible APIs. Covers real-world patterns for library development, advanced type manipulation, and integration with existing JavaScript codebases. Includes performance considerations and best practices for large-scale applications.',
      subject: 'typescript',
      difficulty_level: 'advanced',
      content_type: 'text_snippet',
      tags: ['Generics', 'Type Safety', 'Advanced Types', 'Conditional Types', 'Mapped Types', 'Utility Types'],
      estimated_duration: 180
    },
    {
      id: 'search-5',
      title: 'Mastering Async/Await: Complete Asynchronous JavaScript Guide',
      content: 'Comprehensive guide to asynchronous JavaScript programming with async/await. Learn the evolution from callbacks to promises to async/await, understand the event loop and microtask queue, and master error handling patterns. Explore advanced concepts including parallel execution, race conditions, and performance optimization. Covers real-world scenarios like API integration, file operations, and concurrent processing. Includes debugging techniques, testing strategies, and common pitfalls in asynchronous code.',
      subject: 'javascript',
      difficulty_level: 'intermediate',
      content_type: 'video_script',
      tags: ['Async/Await', 'Promises', 'Error Handling', 'Event Loop', 'Concurrency', 'API Integration'],
      estimated_duration: 140
    },
    {
      id: 'search-6',
      title: 'React Performance Optimization: Advanced Techniques',
      content: 'Deep dive into React performance optimization strategies for production applications. Learn about React.memo, useMemo, useCallback, and when to use each. Understand virtual DOM reconciliation, component re-rendering patterns, and how to identify performance bottlenecks. Explore advanced techniques including code splitting, lazy loading, virtualization for large lists, and bundle optimization. Covers profiling tools, performance monitoring, and real-world optimization case studies.',
      subject: 'react',
      difficulty_level: 'advanced',
      content_type: 'text_snippet',
      tags: ['Performance', 'React.memo', 'useMemo', 'useCallback', 'Code Splitting', 'Virtualization', 'Profiling'],
      estimated_duration: 160
    },
    {
      id: 'search-7',
      title: 'Python Decorators: Complete Advanced Guide',
      content: 'Master Python decorators from basic function decorators to advanced metaclass patterns. Learn how decorators work under the hood, understand the decorator pattern, and explore built-in decorators like @property, @staticmethod, and @classmethod. Dive into advanced topics including parameterized decorators, class decorators, and decorator chaining. Covers real-world applications in web frameworks, caching, authentication, and logging. Includes performance considerations and best practices.',
      subject: 'python',
      difficulty_level: 'advanced',
      content_type: 'video_script',
      tags: ['Decorators', 'Advanced Python', 'Metaclasses', 'Design Patterns', 'Web Frameworks', 'Caching'],
      estimated_duration: 155
    }
  ];

  const generateContentForQuery = async (query: string) => {
    setIsGenerating(true);
    setShowNoResults(false);

    try {
      const subject = selectedSubject === 'all' ? currentSubject : selectedSubject;
      const difficulty = selectedDifficulty === 'all' ? currentDifficulty : selectedDifficulty;

      // Create both video and text content for the custom topic
      const videoContent = createMockContentForQuery(query, subject, difficulty, 'video_script');
      const textContent = createMockContentForQuery(query, subject, difficulty, 'text_snippet');

      // Try to generate content using the edge function
      try {
        const { data, error } = await supabase.functions.invoke('generate-content', {
          body: {
            subject,
            difficulty,
            contentType: 'video_script',
            count: 1,
            customTopic: query
          }
        });

        if (error) {
          console.warn('Database generation failed, using mock content:', error);
        } else {
          console.log('Content generated and saved to database');
        }
      } catch (dbError) {
        console.warn('Database not available, using mock content:', dbError);
      }

      // Always show the generated content immediately in the search results
      const generatedResults = [videoContent, textContent];
      setSearchResults(generatedResults);

      // Add to recently generated for future reference
      setRecentlyGenerated(prev => {
        const updated = [...generatedResults, ...prev].slice(0, 6); // Keep last 6 generated items
        return updated;
      });

      toast.success(`Generated custom content for "${query}"`);

    } catch (error) {
      console.error('Generation error:', error);
      // Fallback to mock content
      const subject = selectedSubject === 'all' ? currentSubject : selectedSubject;
      const difficulty = selectedDifficulty === 'all' ? currentDifficulty : selectedDifficulty;
      const mockGeneratedContent = createMockContentForQuery(query, subject, difficulty);
      setSearchResults([mockGeneratedContent]);
      toast.success(`Generated content for "${query}"`);
    } finally {
      setIsGenerating(false);
    }
  };

  const createMockContentForQuery = (query: string, subject: string, difficulty: string, contentType?: string): SearchResult => {
    const contentTypes = ['video_script', 'text_snippet'] as const;
    const selectedContentType = contentType || contentTypes[Math.floor(Math.random() * contentTypes.length)];

    const isVideo = selectedContentType === 'video_script';
    const titlePrefix = isVideo ?
      `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} ${subject.toUpperCase()}: Deep Dive into ${query}` :
      `Complete Guide to ${query} in ${subject.toUpperCase()}`;

    // Generate more comprehensive and in-depth content based on difficulty level
    const getInDepthContent = () => {
      const baseIntro = isVideo ?
        `Welcome to this comprehensive ${difficulty} ${subject} tutorial! Today we're doing a deep dive into ${query}.` :
        `${query} is a crucial concept in ${subject} development that deserves thorough understanding.`;

      const difficultySpecificContent = {
        beginner: {
          video: `${baseIntro} We'll start from the absolute basics and build your understanding step by step. First, let's understand what ${query} is and why it exists. We'll explore the fundamental concepts, see simple examples, and understand the core principles. I'll show you the most common use cases and help you recognize when to apply ${query}. We'll also cover the basic syntax and walk through several hands-on examples. By the end, you'll have a solid foundation and feel confident using ${query} in your projects.`,
          text: `${baseIntro} This comprehensive guide covers everything a beginner needs to know about ${query}. We'll start with the fundamental concepts and gradually build complexity. You'll learn the basic syntax, understand the underlying principles, and see practical examples. We'll explore common use cases, discuss best practices for beginners, and highlight important gotchas to avoid. The guide includes step-by-step explanations, code examples, and practical exercises to reinforce your learning.`
        },
        intermediate: {
          video: `${baseIntro} As an intermediate developer, you're ready to explore the more nuanced aspects of ${query}. We'll dive into advanced patterns, performance considerations, and real-world applications. I'll show you how ${query} integrates with other ${subject} concepts and demonstrate professional-level implementations. We'll explore edge cases, discuss optimization techniques, and examine how top developers use ${query} in production code. You'll learn advanced patterns, understand the internals, and master the subtleties that separate good developers from great ones.`,
          text: `${baseIntro} This intermediate guide explores the sophisticated aspects of ${query} that professional developers need to master. We'll examine advanced patterns, performance implications, and architectural considerations. You'll learn how ${query} fits into larger systems, understand the trade-offs involved, and discover optimization techniques. The guide covers real-world scenarios, advanced use cases, and integration patterns. We'll also explore debugging techniques, testing strategies, and how to handle complex edge cases that arise in production environments.`
        },
        advanced: {
          video: `${baseIntro} This advanced tutorial assumes you have solid experience with ${subject} and are ready to master the expert-level aspects of ${query}. We'll explore the internal mechanisms, advanced optimization techniques, and cutting-edge patterns. I'll demonstrate how to extend ${query}, create custom implementations, and integrate it with complex architectures. We'll examine performance at scale, discuss memory management, and explore advanced debugging techniques. You'll learn to think like a ${subject} expert and understand the deep principles that govern ${query} behavior.`,
          text: `${baseIntro} This expert-level guide delves into the most sophisticated aspects of ${query} for advanced ${subject} developers. We'll explore the underlying implementation details, advanced architectural patterns, and cutting-edge techniques. You'll learn about performance optimization at scale, memory management strategies, and advanced debugging methodologies. The guide covers complex integration scenarios, custom implementations, and how to extend ${query} for specialized use cases. We'll also examine the latest developments, experimental features, and future directions in ${query} technology.`
        }
      };

      const content = difficultySpecificContent[difficulty as keyof typeof difficultySpecificContent];
      return isVideo ? content.video : content.text;
    };

    // Generate comprehensive tags based on the topic and difficulty
    const generateTags = () => {
      const baseTags = [query, 'Custom Generated', `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Level`];

      const difficultyTags = {
        beginner: ['Fundamentals', 'Getting Started', 'Basic Concepts', 'Step by Step'],
        intermediate: ['Advanced Patterns', 'Best Practices', 'Real World', 'Professional'],
        advanced: ['Expert Level', 'Performance', 'Architecture', 'Deep Dive', 'Optimization']
      };

      const subjectTags = {
        javascript: ['ES6+', 'Modern JS', 'Browser APIs', 'Node.js'],
        react: ['Hooks', 'Components', 'State Management', 'Performance'],
        python: ['Pythonic', 'Data Structures', 'OOP', 'Functional'],
        typescript: ['Type Safety', 'Generics', 'Interfaces', 'Advanced Types']
      };

      return [
        ...baseTags,
        ...difficultyTags[difficulty as keyof typeof difficultyTags],
        ...subjectTags[subject as keyof typeof subjectTags].slice(0, 2)
      ];
    };

    return {
      id: `generated-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: titlePrefix,
      content: getInDepthContent(),
      subject,
      difficulty_level: difficulty,
      content_type: selectedContentType,
      tags: generateTags(),
      estimated_duration: difficulty === 'beginner' ? 90 : difficulty === 'intermediate' ? 120 : 150
    };
  };

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowNoResults(false);
      return;
    }

    setIsSearching(true);
    setShowNoResults(false);

    try {
      // Try to search in database first
      let searchQuery = supabase
        .from('ai_content_pool')
        .select('*')
        .eq('is_active', true)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%,tags.cs.{${query}}`);

      // Apply filters
      if (selectedSubject !== 'all') {
        searchQuery = searchQuery.eq('subject', selectedSubject);
      }
      if (selectedDifficulty !== 'all') {
        searchQuery = searchQuery.eq('difficulty_level', selectedDifficulty);
      }

      const { data, error } = await searchQuery.limit(20);

      if (error) {
        console.warn('Database search failed, using mock data:', error);
        // Use mock data as fallback
        const filteredMockData = mockSearchData.filter(item => {
          const matchesQuery =
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.content.toLowerCase().includes(query.toLowerCase()) ||
            item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));

          const matchesSubject = selectedSubject === 'all' || item.subject === selectedSubject;
          const matchesDifficulty = selectedDifficulty === 'all' || item.difficulty_level === selectedDifficulty;

          return matchesQuery && matchesSubject && matchesDifficulty;
        });

        setSearchResults(filteredMockData);
        setShowNoResults(filteredMockData.length === 0);
      } else {
        setSearchResults(data || []);
        setShowNoResults((data || []).length === 0);
      }
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to mock data
      const filteredMockData = mockSearchData.filter(item => {
        const matchesQuery =
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.content.toLowerCase().includes(query.toLowerCase()) ||
          item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));

        const matchesSubject = selectedSubject === 'all' || item.subject === selectedSubject;
        const matchesDifficulty = selectedDifficulty === 'all' || item.difficulty_level === selectedDifficulty;

        return matchesQuery && matchesSubject && matchesDifficulty;
      });

      setSearchResults(filteredMockData);
      setShowNoResults(filteredMockData.length === 0);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedSubject, selectedDifficulty]);

  // Reset search when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setSelectedSubject(currentSubject);
      setSelectedDifficulty(currentDifficulty);
    }
  }, [isOpen, currentSubject, currentDifficulty]);

  const handleContentClick = (content: SearchResult) => {
    onContentSelect(content);
    onClose();
  };

  const getSubjectColor = (subject: string) => {
    const colors = {
      javascript: 'bg-yellow-500/20 text-yellow-400',
      react: 'bg-blue-500/20 text-blue-400',
      python: 'bg-green-500/20 text-green-400',
      typescript: 'bg-blue-600/20 text-blue-300'
    };
    return colors[subject as keyof typeof colors] || 'bg-gray-500/20 text-gray-400';
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      beginner: 'bg-green-500/20 text-green-400',
      intermediate: 'bg-yellow-500/20 text-yellow-400',
      advanced: 'bg-red-500/20 text-red-400'
    };
    return colors[difficulty as keyof typeof colors] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] bg-black border border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Content
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
            <input
              type="text"
              placeholder="Search for topics, concepts, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex gap-3 items-center">
            <Filter className="w-4 h-4 text-white/70" />
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-white/10 text-white text-sm px-3 py-1 rounded border border-white/20 focus:outline-none focus:border-white/40"
            >
              <option value="all">All Languages</option>
              <option value="javascript">JavaScript</option>
              <option value="react">React</option>
              <option value="python">Python</option>
              <option value="typescript">TypeScript</option>
            </select>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-white/10 text-white text-sm px-3 py-1 rounded border border-white/20 focus:outline-none focus:border-white/40"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* Search Results */}
          <div className="max-h-96 overflow-y-auto space-y-3">
            {isSearching ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-white/50" />
                <span className="ml-2 text-white/70">Searching...</span>
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((result) => (
                <div
                  key={result.id}
                  onClick={() => handleContentClick(result)}
                  className={`p-4 rounded-lg border hover:bg-white/10 cursor-pointer transition-colors ${result.id.startsWith('generated-')
                    ? 'bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-400/30'
                    : 'bg-white/5 border-white/10'
                    }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1">
                      <h3 className="font-semibold text-white line-clamp-1">{result.title}</h3>
                      {result.id.startsWith('generated-') && (
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full">
                          <Sparkles className="w-3 h-3 text-white" />
                          <span className="text-xs text-white font-medium">Generated</span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-white/50 ml-2">{result.estimated_duration}s</span>
                  </div>
                  <p className="text-sm text-white/70 line-clamp-2 mb-3">{result.content}</p>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSubjectColor(result.subject)}`}>
                      {result.subject.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(result.difficulty_level)}`}>
                      {result.difficulty_level.toUpperCase()}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                      {result.content_type === 'video_script' ? 'VIDEO' : 'TEXT'}
                    </span>
                  </div>
                </div>
              ))
            ) : searchQuery && showNoResults ? (
              <div className="text-center py-8 text-white/50">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="mb-4">No results found for "{searchQuery}"</p>
                <p className="text-sm mb-6">Try different keywords or adjust your filters</p>

                {/* Generate Content Option */}
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <Sparkles className="w-8 h-8 mx-auto mb-3 text-purple-400" />
                  <h3 className="text-white font-semibold mb-2">Generate Custom Content</h3>
                  <p className="text-sm text-white/70 mb-4">
                    Can't find what you're looking for? We can generate personalized content about "{searchQuery}"
                  </p>
                  <Button
                    onClick={() => generateContentForQuery(searchQuery)}
                    disabled={isGenerating}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Generate Content
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : searchQuery ? (
              <div className="text-center py-8 text-white/50">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Searching...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {recentlyGenerated.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <h3 className="text-sm font-semibold text-white">Recently Generated</h3>
                    </div>
                    <div className="space-y-2">
                      {recentlyGenerated.slice(0, 3).map((result) => (
                        <div
                          key={result.id}
                          onClick={() => handleContentClick(result)}
                          className="p-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-400/30 rounded-lg hover:bg-purple-500/20 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-medium text-white line-clamp-1">{result.title}</h4>
                            <span className="text-xs text-white/50">{result.estimated_duration}s</span>
                          </div>
                          <p className="text-xs text-white/60 line-clamp-1">{result.content}</p>
                          <div className="flex items-center gap-1 mt-2">
                            <span className={`px-1.5 py-0.5 rounded text-xs ${getSubjectColor(result.subject)}`}>
                              {result.subject.toUpperCase()}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-xs ${getDifficultyColor(result.difficulty_level)}`}>
                              {result.difficulty_level.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-center py-8 text-white/50">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Start typing to search for content</p>
                  <p className="text-sm mt-1">Search by topic, concept, or keyword</p>
                  {recentlyGenerated.length === 0 && (
                    <p className="text-xs mt-2 text-white/40">
                      Can't find what you need? We can generate custom content for you!
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}