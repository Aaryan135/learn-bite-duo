import { Search, User, ArrowLeft, Code, LogOut, Bookmark } from "lucide-react";
import { useContentStore } from "@/store/contentStore";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { SearchModal } from "./SearchModal";
import { SavedContentModal } from "./SavedContentModal";
import { getXpProfile } from "@/services/xpService";
import { motion } from "framer-motion";
import { useXpStore, xpThreshold } from "@/store/xpStore";

interface HeaderProps {
  onBackToHome?: () => void;
  onContentSelect?: (content: any) => void;
}

const Header = ({ onBackToHome, onContentSelect }: HeaderProps) => {
  const { selectedSubject, selectedDifficulty, setSelectedSubject, setSelectedDifficulty, getSavedContent } = useContentStore();
  const categories = [
    { id: 'all', name: 'All' },
    { id: 'python', name: 'Python' },
    { id: 'javascript', name: 'JavaScript' },
    { id: 'typescript', name: 'TypeScript' },
    { id: 'react', name: 'React' },
    { id: 'java', name: 'Java' },
    { id: 'cpp', name: 'C++' },
  ];
  const levels = [
    { id: 'all', name: 'All Levels' },
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' },
  ];
  const { user, signOut } = useAuth();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const savedCount = getSavedContent().length;
  const xp = useXpStore((s) => s.xp);
  const level = useXpStore((s) => s.level);
  const setXpLevel = useXpStore((s) => s.setXpLevel);

  useEffect(() => {
    (async () => {
      const profile = await getXpProfile();
      if (profile) setXpLevel(profile.xp, profile.level);
    })();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully!");
      // Redirect to home page after logout
      if (onBackToHome) {
        onBackToHome();
      }
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10 shadow-lg">
      <div className="container mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-4">
          {onBackToHome && (
            <button 
              onClick={onBackToHome}
              className="p-1.5 sm:p-2 hover:bg-white/10 rounded-full text-white transition-colors"
              title="Back to Home"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          )}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Code className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
            <h1 className="text-lg sm:text-xl font-bold text-white">CodeSnap</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 sm:space-x-2">
          {level != null && xp != null && (
            <div className="hidden md:flex items-center gap-2 mr-2 text-white/80">
              <div className="text-xs">Lvl {level}</div>
              <div className="w-24 h-2 bg-white/10 rounded overflow-hidden">
                <motion.div 
                  className="h-2 bg-gradient-to-r from-purple-500 to-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, Math.floor((xp % xpThreshold(level)) / Math.max(1, xpThreshold(level)) * 100))}%` }}
                  transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                />
              </div>
            </div>
          )}

          {/* Category Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="text-white bg-white/10 px-2 sm:px-3 py-1 rounded border border-white/20 focus:outline-none focus:border-white/40 w-28 sm:w-36 justify-between">
                {categories.find(c => c.id === selectedSubject)?.name || 'Select Category'}
                <span className="ml-2">▼</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-28 sm:w-36 z-[100] bg-neutral-900 border border-neutral-700 shadow-xl">
              {categories.map(category => (
                <DropdownMenuItem
                  key={category.id}
                  onSelect={() => setSelectedSubject(category.id)}
                  className={`text-white ${selectedSubject === category.id ? 'bg-primary text-primary-foreground' : ''}`}
                >
                  {category.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Level Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="text-white bg-white/10 px-2 sm:px-3 py-1 rounded border border-white/20 focus:outline-none focus:border-white/40 w-28 sm:w-36 justify-between">
                {levels.find(l => l.id === selectedDifficulty)?.name || 'Select Level'}
                <span className="ml-2">▼</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-28 sm:w-36 z-[100] bg-neutral-900 border border-neutral-700 shadow-xl">
              {levels.map(level => (
                <DropdownMenuItem
                  key={level.id}
                  onSelect={() => setSelectedDifficulty(level.id as 'all' | 'beginner' | 'intermediate' | 'advanced')}
                  className={`text-white ${selectedDifficulty === level.id ? 'bg-primary text-primary-foreground' : ''}`}
                >
                  {level.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>



          <button 
            onClick={() => setShowSearchModal(true)}
            className="p-1.5 sm:p-2 hover:bg-white/10 rounded-full text-white transition-colors"
            title="Search Content"
          >
            <Search className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          <button 
            onClick={() => setShowSavedModal(true)}
            className="p-1.5 sm:p-2 hover:bg-white/10 rounded-full text-white transition-colors relative"
            title="Saved Content"
          >
            <Bookmark className="h-4 w-4 sm:h-5 sm:w-5" />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {savedCount > 9 ? '9+' : savedCount}
              </span>
            )}
          </button>
          
          {user ? (
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 bg-white/10 rounded-full">
                <User className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm hidden sm:inline">
                  {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                </span>
              </div>
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                className="p-1.5 sm:p-2 hover:bg-white/10 rounded-full text-white"
                title="Sign Out"
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          ) : (
            <button className="p-1.5 sm:p-2 hover:bg-white/10 rounded-full text-white">
              <User className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Search Modal */}
      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onContentSelect={(content) => {
          if (onContentSelect) {
            onContentSelect(content);
          }
        }}
      />

      {/* Saved Content Modal */}
      <SavedContentModal
        isOpen={showSavedModal}
        onClose={() => setShowSavedModal(false)}
        onContentSelect={(content) => {
          if (onContentSelect) {
            onContentSelect(content);
          }
        }}
      />
    </header>
  );
};

export default Header;