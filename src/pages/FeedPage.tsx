
import { useContentStore } from '@/store/contentStore';
import { Button } from '@/components/ui/button';
import { ContentFeed } from '@/components/ContentFeed';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

/**
 * FeedPage is the main page for displaying the vertical content feed.
 * It provides subject and difficulty filters and renders the ContentFeed component.
 */
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
    <div className="fixed inset-0 w-full h-full bg-black">
      <ContentFeed />
    </div>
  );
}


