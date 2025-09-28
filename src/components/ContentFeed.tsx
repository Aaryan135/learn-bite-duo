import { useEffect } from 'react';
import { useContentStore } from '@/store/contentStore';
import { useAuth } from '@/hooks/useAuth';
import { ContentCard } from './ContentCard';
import { DebugPanel } from './DebugPanel';
import { Button } from '@/components/ui/button';

export function ContentFeed() {
  const { triggerContentGeneration } = useContentStore();
  const {
    content,
    currentIndex,
    loading,
    loadingMore,
    setCurrentIndex,
    loadInitialContent,
    loadMoreContent,
    triggerBackgroundGeneration
  } = useContentStore();
  
  const { user, loading: authLoading, signInAnonymously } = useAuth();
  const { selectedSubject, selectedDifficulty } = useContentStore();

  // Load initial content when user is available
  useEffect(() => {
    if (user) {
      loadInitialContent();
    }
  }, [user, selectedSubject, selectedDifficulty]);

  // Track when user scrolls through content
  useEffect(() => {
    if (currentIndex > 0 && currentIndex % 5 === 0) {
      // User has viewed 5 more pieces, trigger background check
      triggerBackgroundGeneration();
    }
  }, [currentIndex]);

  // Auto-generate new content if only 5 reels are left
  useEffect(() => {
    if (
      content.length > 0 &&
      currentIndex >= content.length - 5 &&
      typeof triggerContentGeneration === 'function' &&
      selectedSubject && selectedSubject !== 'all'
    ) {
      triggerContentGeneration();
    }
  }, [currentIndex, content.length, selectedSubject]);

  const handleNext = () => {
    if (currentIndex < content.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // At the end, try to load more content
      loadMoreContent();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Show auth loading
  if (authLoading) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="text-white text-lg">Initializing...</div>
      </div>
    );
  }

  // Show sign in if no user
  if (!user) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="text-center text-white space-y-4">
          <h2 className="text-2xl font-bold">Welcome to CodeSnap</h2>
          <p className="text-white/70">Start learning with bite-sized coding content</p>
          <Button onClick={signInAnonymously} className="bg-white text-black hover:bg-white/90">
            Start Learning
          </Button>
        </div>
      </div>
    );
  }

  // Show content loading
  if (loading && content.length === 0) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="text-white text-lg">Loading fresh content...</div>
      </div>
    );
  }

  // Show empty state
  if (!loading && content.length === 0) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="text-center text-white space-y-4">
          <h2 className="text-xl font-bold">No content available</h2>
          <p className="text-white/70">Let's generate some fresh content for you!</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={loadInitialContent} variant="outline">
              Refresh
            </Button>
            <Button 
              onClick={() => {
                const { triggerContentGeneration } = useContentStore.getState();
                triggerContentGeneration();
              }} 
              className="bg-white text-black hover:bg-white/90"
            >
              Generate Content
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full h-full bg-black flex flex-col overflow-hidden">
      <div className="flex-1 w-full h-full overflow-y-auto snap-y snap-mandatory scrollbar-hide">
        {content.map((item, index) => (
          <div
            key={item.id}
            className="snap-start w-full h-full flex items-stretch"
          >
            <ContentCard
              content={item}
              isActive={currentIndex === index}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          </div>
        ))}
        {/* Loading indicator for more content */}
        {loadingMore && (
          <div className="snap-start w-full h-full flex items-center justify-center bg-black">
            <div className="text-white text-base sm:text-lg">Loading more content...</div>
          </div>
        )}
      </div>

      {loading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="text-white">Loading more content...</div>
        </div>
      )}

      {/* Debug Panel */}
      <DebugPanel />
    </div>
  );
}