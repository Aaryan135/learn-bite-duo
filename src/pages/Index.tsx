import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AuthModalSimple } from "@/components/AuthModalSimple";
import ReelsContainer from "@/components/ReelsContainer";

const Index = () => {
  const [mode, setMode] = useState<'video' | 'text'>('video');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();

  // Show sign-in modal if not signed in
  if (!user) {
    return (
      <AuthModalSimple
        isOpen={true}
        onClose={() => {}}
        onSuccess={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden">
      <ReelsContainer 
        mode={mode} 
        onModeChange={setMode}
        selectedCategory={selectedCategory}
      />
    </div>
  );
};

export default Index;
