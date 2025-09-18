import { useState } from "react";
import Header from "@/components/Header";
import ModeToggle from "@/components/ModeToggle";
import CategoryFilter from "@/components/CategoryFilter";
import ContentFeed from "@/components/ContentFeed";

const Index = () => {
  const [mode, setMode] = useState<'video' | 'text'>('video');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Mock user data - will come from authentication/backend
  const userStats = {
    xp: 2847,
    streak: 7,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header userXP={userStats.xp} userStreak={userStats.streak} />
      
      <main className="pb-20">
        {/* Mode Toggle */}
        <div className="sticky top-[73px] z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 py-4">
          <div className="container mx-auto px-4 flex justify-center">
            <ModeToggle mode={mode} onModeChange={setMode} />
          </div>
        </div>

        {/* Category Filter */}
        <CategoryFilter 
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Main Content Feed */}
        <ContentFeed mode={mode} selectedCategory={selectedCategory} />
      </main>
    </div>
  );
};

export default Index;
