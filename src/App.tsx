import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HomePage } from "./components/HomePage";
import { ContentFeed } from "./components/ContentFeed";
import Header from "./components/Header";
import { ThemeToggle } from "./components/ThemeToggle";
import LevelUpModal from "./components/LevelUpModal";
import FeedPage from "./pages/FeedPage";
import ProfilePage from "./pages/ProfilePage";
// import AnalyticsPage from "./pages/AnalyticsPage";
import BookmarksPage from "./pages/BookmarksPage";
import SettingsPage from "./pages/SettingsPage";
import { useContentStore } from "./store/contentStore";

const queryClient = new QueryClient();

import CodingPracticePage from './pages/CodingPracticePage';

const App = () => {
  const [showReels, setShowReels] = useState(false);
  const [activeTab, setActiveTab] = useState<'feed' | 'profile' | 'analytics' | 'bookmarks' | 'settings' | 'coding'>('feed');
  const { setContent, setCurrentIndex } = useContentStore();

  const handleSearchContentSelect = (searchContent: any) => {
    // Convert search result to ContentItem format
    const contentItem = {
      id: searchContent.id,
      title: searchContent.title,
      content: searchContent.content,
      code_examples: { example: searchContent.code_examples?.example || '' },
      subject: searchContent.subject,
      difficulty_level: searchContent.difficulty_level,
      content_type: searchContent.content_type,
      estimated_duration: searchContent.estimated_duration,
      tags: searchContent.tags || [],
      used_count: 0,
      is_active: true,
      created_by_ai_at: new Date().toISOString(),
    };

    // Add the selected content to the beginning of the content array
    setContent([contentItem]);
    setCurrentIndex(0);
    setShowReels(true);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <div className="min-h-screen bg-black">
          <ThemeToggle />
          <Header 
            onBackToHome={() => {
              setShowReels(false);
              setActiveTab('feed');
            }}
            onContentSelect={handleSearchContentSelect}
          />
          <LevelUpModal />
          {activeTab === 'feed' && <FeedPage />}
          {activeTab === 'profile' && <ProfilePage />}
          {/* {activeTab === 'analytics' && <AnalyticsPage />} */}
          {activeTab === 'bookmarks' && <BookmarksPage />}
          {activeTab === 'settings' && <SettingsPage />}
          {activeTab === 'coding' && <CodingPracticePage />}

          <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/90 backdrop-blur border-t border-white/10">
            <div className="flex items-center justify-around h-12">
              {(['feed','profile','bookmarks','settings','coding'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-2 text-sm ${activeTab === tab ? 'text-white' : 'text-white/60'} hover:text-white`}
                >
                  {tab === 'coding' ? 'Coding' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
