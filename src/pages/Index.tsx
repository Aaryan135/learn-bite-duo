import { useState } from "react";
import ReelsContainer from "@/components/ReelsContainer";

const Index = () => {
  const [mode, setMode] = useState<'video' | 'text'>('video');
  const [selectedCategory, setSelectedCategory] = useState('all');

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
