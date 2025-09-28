import { useState } from 'react';
import { Bookmark, X, Play, Clock, Tag } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useContentStore } from '@/store/contentStore';

interface SavedContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContentSelect: (content: any) => void;
}

export function SavedContentModal({ isOpen, onClose, onContentSelect }: SavedContentModalProps) {
  const { getSavedContent, toggleSave } = useContentStore();
  const savedContent = getSavedContent();

  const handleContentClick = (content: any) => {
    onContentSelect(content);
    onClose();
  };

  const handleRemoveSaved = (contentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSave(contentId);
  };

  const getSubjectColor = (subject: string) => {
    const colors = {
      javascript: 'bg-yellow-500/20 text-yellow-400',
      react: 'bg-blue-500/20 text-blue-400',
      python: 'bg-green-500/20 text-green-400',
      typescript: 'bg-blue-600/20 text-blue-300'
    };
    return colors[subject as keyof typeof colors] || 'bg-gray-500/20 text-gray-400';
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      beginner: 'bg-green-500/20 text-green-400',
      intermediate: 'bg-yellow-500/20 text-yellow-400',
      advanced: 'bg-red-500/20 text-red-400'
    };
    return colors[difficulty as keyof typeof colors] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] bg-black border border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-purple-400" />
            Saved Content
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {savedContent.length > 0 ? (
            <div className="max-h-96 overflow-y-auto space-y-3">
              {savedContent.map((content) => (
                <div
                  key={content.id}
                  onClick={() => handleContentClick(content)}
                  className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 cursor-pointer transition-colors group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white line-clamp-2 flex-1 pr-2">
                      {content.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-white/50">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs">{content.estimated_duration}s</span>
                      </div>
                      <button
                        onClick={(e) => handleRemoveSaved(content.id, e)}
                        className="p-1 rounded-full hover:bg-red-500/20 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove from saved"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-white/70 line-clamp-2 mb-3">
                    {content.content}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSubjectColor(content.subject)}`}>
                        {content.subject.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(content.difficulty_level)}`}>
                        {content.difficulty_level.toUpperCase()}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                        {content.content_type === 'video_script' ? 'VIDEO' : 'TEXT'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-white/50">
                      <div className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        <span className="text-xs">{content.tags?.length || 0} tags</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-white/50">
              <Bookmark className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Saved Content</h3>
              <p className="text-sm">
                Save content by clicking the bookmark icon on any tutorial
              </p>
              <Button
                onClick={onClose}
                className="mt-4 bg-purple-500 hover:bg-purple-600 text-white"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Learning
              </Button>
            </div>
          )}
        </div>

        {savedContent.length > 0 && (
          <div className="flex justify-between items-center pt-4 border-t border-white/10">
            <span className="text-sm text-white/70">
              {savedContent.length} saved {savedContent.length === 1 ? 'item' : 'items'}
            </span>
            <Button
              onClick={onClose}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}