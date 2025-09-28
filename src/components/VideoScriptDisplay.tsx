import { useState, useEffect } from 'react';
import { ContentItem } from '@/store/contentStore';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface VideoScriptDisplayProps {
  content: ContentItem;
  isPlaying: boolean;
}

export function VideoScriptDisplay({ content, isPlaying }: VideoScriptDisplayProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const words = content.content.split(' ');
  const wordsPerSecond = 2.5; // Average speaking speed

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentWordIndex(prev => {
        if (prev < words.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1000 / wordsPerSecond);

    return () => clearInterval(interval);
  }, [isPlaying, words.length]);

  useEffect(() => {
    if (!isPlaying) {
      setCurrentWordIndex(0);
    }
  }, [isPlaying]);

  const displayedText = words.slice(0, currentWordIndex + 1).join(' ');

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-6 pb-40 sm:pb-44 md:pb-48 text-white max-h-screen overflow-hidden">
      {/* Video-style content display - responsive width */}
      <div className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg w-full space-y-2 sm:space-y-3 max-h-full overflow-y-auto">
        
        {/* Script text with typewriter effect - responsive sizing */}
        <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3 sm:p-4 md:p-5 min-h-[120px] sm:min-h-[140px]">
          <p className="text-sm sm:text-base md:text-lg leading-relaxed">
            {displayedText}
            {isPlaying && currentWordIndex < words.length - 1 && (
              <span className="animate-pulse">|</span>
            )}
          </p>
        </div>

        {/* Code example - responsive sizing */}
        {content.code_examples?.example && (
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            <div className="bg-gray-800 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-300">
              Code Example
            </div>
            <SyntaxHighlighter
              language={getLanguageFromSubject(content.subject)}
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                padding: window.innerWidth < 640 ? '0.5rem' : '0.75rem',
                background: 'transparent',
                fontSize: window.innerWidth < 640 ? '11px' : '13px',
                maxHeight: '200px',
                overflow: 'auto'
              }}
            >
              {content.code_examples.example}
            </SyntaxHighlighter>
          </div>
        )}

        {/* Key takeaways */}
        {content.tags && content.tags.length > 0 && (
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3 space-y-2">
            <h4 className="text-sm font-semibold text-white/80">Key Takeaways:</h4>
            <div className="grid gap-2">
              {content.tags.slice(0, 3).map((tag, index) => (
                <div 
                  key={index} 
                  className="flex items-center text-sm text-white/70 bg-white/10 rounded px-3 py-2"
                >
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-3 flex-shrink-0" />
                  {tag}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getLanguageFromSubject(subject: string): string {
  const languageMap: Record<string, string> = {
    javascript: 'javascript',
    react: 'jsx',
    python: 'python',
    typescript: 'typescript',
    css: 'css',
    html: 'html'
  };
  
  return languageMap[subject.toLowerCase()] || 'javascript';
}