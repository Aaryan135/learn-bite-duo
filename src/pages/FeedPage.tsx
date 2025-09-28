
import { useContentStore } from '@/store/contentStore';
import { Button } from '@/components/ui/button';
import { ContentFeed } from '@/components/ContentFeed';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

export default function FeedPage() {
  const { selectedSubject, setSelectedSubject, selectedDifficulty, setSelectedDifficulty } = useContentStore();

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

  return (
    <div className="flex flex-col min-h-screen pt-14 sm:pt-16">
      {/* Vertical feed */}
      <div className="flex-1 w-full max-w-3xl mx-auto flex flex-col">
        <ContentFeed />
      </div>
    </div>
  );
}


