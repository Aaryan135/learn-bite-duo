import { useState, useEffect } from 'react';
import { useContentStore } from '@/store/contentStore';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { AuthModalSimple } from './AuthModalSimple';
import { SearchModal } from './SearchModal';
import { Play, Code, Zap, BookOpen, User, Search } from 'lucide-react';
import Heatmap from './Heatmap';
import { toast } from 'sonner';

interface HomePageProps {
  onStartLearning: () => void;
  onContentSelect?: (content: any) => void;
}

export function HomePage({ onStartLearning, onContentSelect }: HomePageProps) {
  const { selectedSubject, selectedDifficulty, setSelectedSubject, setSelectedDifficulty, triggerBackgroundGeneration, triggerContentGeneration } = useContentStore();
  const { user, signOut } = useAuth();

  // On login, generate content for all subjects
  useEffect(() => {
    if (user) {
      triggerBackgroundGeneration();
    }
    // eslint-disable-next-line
  }, [user]);

  // When subject changes, generate more content for that subject
  useEffect(() => {
    if (user && selectedSubject && selectedSubject !== 'all') {
      triggerContentGeneration();
    }
    // eslint-disable-next-line
  }, [user, selectedSubject]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  
  const subjects = [
    { id: 'javascript', name: 'JavaScript', icon: '🟨', color: 'from-yellow-500 to-yellow-600' },
    { id: 'react', name: 'React', icon: '⚛️', color: 'from-blue-400 to-cyan-500' },
    { id: 'python', name: 'Python', icon: '🐍', color: 'from-green-500 to-blue-500' },
    { id: 'typescript', name: 'TypeScript', icon: '🔷', color: 'from-blue-600 to-blue-700' }
  ];

  const difficulties = [
    { id: 'beginner', name: 'Beginner', description: 'New to programming', icon: '🌱' },
    { id: 'intermediate', name: 'Intermediate', description: 'Some experience', icon: '🚀' },
    { id: 'advanced', name: 'Advanced', description: 'Experienced developer', icon: '⚡' }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-y-auto">
      {/* Hero Section */}
      <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-8">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
        
        {/* Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Logo */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Code className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                CodeSnap
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-white/70 mb-8">
              Learn coding in bite-sized, engaging reels
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <Play className="w-8 h-8 text-purple-400 mb-3 mx-auto" />
              <h3 className="text-lg font-semibold mb-2">Short & Sweet</h3>
              <p className="text-white/60 text-sm">60-90 second coding lessons that fit your schedule</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <Zap className="w-8 h-8 text-blue-400 mb-3 mx-auto" />
              <h3 className="text-lg font-semibold mb-2">AI-Powered</h3>
              <p className="text-white/60 text-sm">Fresh content generated just for you</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <BookOpen className="w-8 h-8 text-green-400 mb-3 mx-auto" />
              <h3 className="text-lg font-semibold mb-2">Interactive</h3>
              <p className="text-white/60 text-sm">Code examples and hands-on learning</p>
            </div>
          </div>

          {/* Language Selection */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Choose Your Language</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {subjects.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => setSelectedSubject(subject.id)}
                  className={`relative p-6 rounded-xl border-2 transition-all duration-300 ${
                     selectedSubject === subject.id
                      ? 'border-white bg-white/10 scale-105'
                      : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                  }`}
                >
                  <div className="text-3xl mb-2">{subject.icon}</div>
                  <div className="font-semibold">{subject.name}</div>
                  {selectedSubject === subject.id && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Selection */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Select Your Level</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {difficulties.map((difficulty) => (
                <button
                  key={difficulty.id}
                  onClick={() => setSelectedDifficulty(difficulty.id as 'beginner' | 'intermediate' | 'advanced' | 'all')}
                  className={`relative p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                     selectedDifficulty === difficulty.id
                      ? 'border-white bg-white/10 scale-105'
                      : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{difficulty.icon}</span>
                    <span className="font-semibold text-lg">{difficulty.name}</span>
                  </div>
                  <p className="text-white/60 text-sm">{difficulty.description}</p>
                  {selectedDifficulty === difficulty.id && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Authentication Section */}
          {user ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3 text-white/70 mb-4">
                <User className="w-5 h-5" />
                <span>Welcome back, {user.user_metadata?.full_name || user.email?.split('@')[0] || 'Learner'}!</span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={onStartLearning}
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-4 text-xl font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Play className="w-6 h-6 mr-3" />
                  Continue Learning
                </Button>
                
                <Button
                  onClick={() => setShowSearchModal(true)}
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-xl font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Search className="w-6 h-6 mr-3" />
                  Search Topics
                </Button>
              </div>

              <div className="flex gap-2 justify-center">
                <Button
                  onClick={() => setShowAuthModal(true)}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Switch Account
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      await signOut();
                      toast.success("Signed out successfully!");
                    } catch (error) {
                      toast.error("Error signing out");
                    }
                  }}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Sign Out
                </Button>
              </div>

              {/* Engagement Heatmap */}
              <div className="max-w-3xl mx-auto mt-6">
                <Heatmap months={6} />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => setShowAuthModal(true)}
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-4 text-xl font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Play className="w-6 h-6 mr-3" />
                  Start Learning
                </Button>
                
                <Button
                  onClick={() => setShowSearchModal(true)}
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-xl font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Search className="w-6 h-6 mr-3" />
                  Search Topics
                </Button>
              </div>
              
              <p className="text-white/50 text-sm">
                Sign in to save your progress and get personalized content
              </p>
            </div>
          )}

          <p className="text-white/50 text-sm mt-4">
      {selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)} level • Unlimited content
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20 px-6 bg-gradient-to-r from-purple-900/10 to-blue-900/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">Join Thousands of Developers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">10K+</div>
              <div className="text-white/70">Active Learners</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">50K+</div>
              <div className="text-white/70">Lessons Completed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">4.9★</div>
              <div className="text-white/70">Average Rating</div>
            </div>
          </div>
        </div>

        {/* Authentication Modal */}
        <AuthModalSimple
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false);
            onStartLearning();
          }}
        />

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
      </div>
    </div>
  );
}