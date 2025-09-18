import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface ContentGeneratorProps {
  mode: 'video' | 'text';
  onContentGenerated: (content: any) => void;
}

const ContentGenerator = ({ mode, onContentGenerated }: ContentGeneratorProps) => {
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState('beginner');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!subject.trim()) {
      toast({
        title: "Subject Required",
        description: "Please enter a programming subject to generate content about.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          subject: subject.trim(),
          type: mode,
          difficulty: difficulty
        }
      });

      if (error) throw error;

      if (data?.content) {
        onContentGenerated(data.content);
        toast({
          title: "Content Generated!",
          description: `New ${mode} content about ${subject} has been created.`,
        });
        setSubject('');
      } else {
        throw new Error('No content received from API');
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="mx-4 mb-6 bg-card/50 backdrop-blur-sm border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">
            Generate AI {mode === 'video' ? 'Video' : 'Article'}
          </h3>
        </div>
        
        <div className="space-y-3">
          <Input
            placeholder="Enter programming subject (e.g., Python loops, React hooks)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="bg-background/50 border-border/50"
          />
          
          <div className="flex gap-2">
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="flex-1 bg-background/50 border-border/50">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating || !subject.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentGenerator;