import { useState, useEffect } from 'react';
import { ContentItem } from '@/store/contentStore';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface TextSnippetDisplayProps {
  content: ContentItem;
  isPlaying: boolean;
}

export function TextSnippetDisplay({ content, isPlaying }: TextSnippetDisplayProps) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;

    const duration = content.estimated_duration * 1000; // Convert to milliseconds
    const startTime = Date.now();

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setScrollProgress(progress);

      if (progress < 1) {
        requestAnimationFrame(updateProgress);
      }
    };

    requestAnimationFrame(updateProgress);
  }, [isPlaying, content.estimated_duration]);

  useEffect(() => {
    if (!isPlaying) {
      setScrollProgress(0);
    }
  }, [isPlaying]);

  return (
    <div className="w-full h-full flex items-center justify-center p-4 sm:p-6 pb-40 sm:pb-44 md:pb-48 text-white max-h-screen overflow-hidden">
      <div className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg w-full space-y-2 sm:space-y-3 max-h-full overflow-y-auto">
        
        {/* Main content - responsive sizing */}
        <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3 sm:p-4 md:p-5 space-y-2 sm:space-y-3">
          <h2 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3">{content.title}</h2>
          
          <div className="prose prose-invert max-w-none">
            <p className="text-xs sm:text-sm md:text-base leading-relaxed text-white/90">
              {content.content}
            </p>
          </div>
        </div>

        {/* Code example - responsive sizing */}
        {content.code_examples?.example && (
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            <div className="bg-gray-800 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-300 flex items-center justify-between">
              <span>Code Example</span>
              <span className="text-xs text-gray-400">
                {getLanguageFromSubject(content.subject).toUpperCase()}
              </span>
            </div>
            <SyntaxHighlighter
              language={getLanguageFromSubject(content.subject)}
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                padding: window.innerWidth < 640 ? '0.5rem' : '0.75rem',
                background: 'transparent',
                fontSize: window.innerWidth < 640 ? '11px' : window.innerWidth < 768 ? '12px' : '13px',
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

        {/* Reading progress indicator */}
        <div className="flex items-center justify-center">
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  scrollProgress > i / 5 ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
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