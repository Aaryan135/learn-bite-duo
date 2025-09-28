import { useState } from 'react';
import { useContentStore } from '@/store/contentStore';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const { 
    content, 
    currentIndex,
    selectedSubject, 
    selectedDifficulty, 
    loadingMore,
  // isGenerating, // Remove if not in store
    triggerContentGeneration,
    loadMoreContent 
  } = useContentStore();

  const addLog = (message: string) => {
    setLogs(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testDatabase = async () => {
    addLog('Testing database connection...');
    try {
      const { data, error, count } = await supabase
        .from('ai_content_pool')
        .select('*', { count: 'exact' })
        .eq('is_active', true);
      
      if (error) {
        addLog(`❌ Database error: ${error.message}`);
      } else {
        addLog(`✅ Database connected. Total content: ${count || 0}`);
        addLog(`✅ Sample content: ${data?.length || 0} items loaded`);
      }
    } catch (error) {
      addLog(`❌ Database test failed: ${error}`);
    }
  };

  const testGeneration = async () => {
    addLog('Testing content generation...');
    try {
      // Only send if not 'all'
      if (selectedSubject === 'all' || selectedDifficulty === 'all') {
        addLog('❌ Please select a specific subject and difficulty (not "all")');
        return;
      }
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          subject: selectedSubject,
          difficulty: selectedDifficulty,
          contentType: 'video_script',
          count: 1
        }
      });
      
      if (error) {
        addLog(`❌ Generation error: ${error.message}`);
      } else {
        addLog(`✅ Generation successful: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      addLog(`❌ Generation test failed: ${error}`);
    }
  };

  const checkContent = async () => {
  addLog(`Checking content for ${selectedSubject}-${selectedDifficulty}...`);
    try {
      const { data, error } = await supabase
        .from('ai_content_pool')
        .select('*')
        .eq('is_active', true)
        .eq('subject', selectedSubject)
        .eq('difficulty_level', selectedDifficulty)
        .order('created_by_ai_at', { ascending: false })
        .limit(5);
      
      if (error) {
        addLog(`❌ Content check error: ${error.message}`);
      } else {
        addLog(`✅ Found ${data?.length || 0} items for ${selectedSubject}-${selectedDifficulty}`);
        if (data && data.length > 0) {
          addLog(`Latest: "${data[0].title}"`);
        }
      }
    } catch (error) {
      addLog(`❌ Content check failed: ${error}`);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-20 right-4 z-40 bg-red-500 text-white px-2 py-1 rounded text-xs shadow-lg"
      >
        Debug
      </button>
    );
  }

  return (
    <div className="fixed top-20 right-4 z-40 bg-black/95 backdrop-blur-sm text-white p-4 rounded-lg max-w-sm max-h-96 overflow-y-auto border border-white/20 shadow-xl">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-bold">Debug Panel</h3>
        <button onClick={() => setIsOpen(false)} className="text-white/70">×</button>
      </div>
      
      <div className="space-y-2 text-xs">
        <div>
          <strong>Current:</strong> {selectedSubject} - {selectedDifficulty}
        </div>
        <div>
          <strong>Content:</strong> {currentIndex + 1}/{content.length}
        </div>
        <div>
          <strong>Remaining:</strong> {content.length - currentIndex - 1}
        </div>
        <div className="flex gap-2">
          {loadingMore && <span className="text-yellow-400">Loading...</span>}
          {/* {isGenerating && <span className="text-blue-400">Generating...</span>} */}
        </div>
        
        <div className="flex gap-1 flex-wrap">
          <Button size="sm" onClick={testDatabase} className="text-xs">
            Test DB
          </Button>
          <Button size="sm" onClick={testGeneration} className="text-xs">
            Test Gen
          </Button>
          <Button size="sm" onClick={triggerContentGeneration} className="text-xs">
            Generate
          </Button>
          <Button size="sm" onClick={checkContent} className="text-xs">
            Check Content
          </Button>
          <Button size="sm" onClick={() => {
            const { loadInitialContent } = useContentStore.getState();
            addLog('Manually refreshing content...');
            loadInitialContent();
          }} className="text-xs">
            Refresh
          </Button>
          <Button size="sm" onClick={() => {
            addLog('Loading more content...');
            loadMoreContent();
          }} className="text-xs">
            Load More
          </Button>
        </div>
        
        <div className="border-t border-white/20 pt-2">
          <strong>Logs:</strong>
          <div className="mt-1 space-y-1 max-h-32 overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i} className="text-xs text-white/80">{log}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}