import { Play, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ModeToggleProps {
  mode: 'video' | 'text';
  onModeChange: (mode: 'video' | 'text') => void;
}

const ModeToggle = ({ mode, onModeChange }: ModeToggleProps) => {
  return (
    <div className="flex items-center gap-2 p-1 bg-surface rounded-xl border border-border/50">
      <Button
        variant={mode === 'video' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onModeChange('video')}
        className={`mode-toggle flex items-center gap-2 rounded-lg px-4 py-2 transition-all duration-300 ${
          mode === 'video' 
            ? 'bg-gradient-primary text-primary-foreground shadow-glow' 
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Play className="w-4 h-4" />
        <span className="font-medium">Video Shorts</span>
      </Button>
      
      <Button
        variant={mode === 'text' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onModeChange('text')}
        className={`mode-toggle flex items-center gap-2 rounded-lg px-4 py-2 transition-all duration-300 ${
          mode === 'text' 
            ? 'bg-gradient-primary text-primary-foreground shadow-glow' 
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <FileText className="w-4 h-4" />
        <span className="font-medium">Text Snippets</span>
      </Button>
    </div>
  );
};

export default ModeToggle;