import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subject, difficulty, contentType, count = 5 } = await req.json();
    
    if (!subject || !difficulty || !contentType) {
      return new Response(JSON.stringify({ error: 'Subject, difficulty, and contentType are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    console.log(`Generating ${count} pieces of ${contentType} content for ${subject} - ${difficulty}`);

    const prompts = {
      video_script: `Generate a ${difficulty} level ${subject} coding tutorial script for a 60-90 second video. 
      Format as JSON with:
      {
        "title": "Catchy, specific title (max 50 chars)",
        "script": "Natural speaking script for video narration",
        "codeExample": "Working, practical code example",
        "keyPoints": ["key point 1", "key point 2", "key point 3"],
        "difficulty": "${difficulty}",
        "estimatedDuration": 75,
        "tags": ["${subject}", "${difficulty}", "tutorial"]
      }
      Make it engaging, practical, and perfect for short-form video content. Focus on ONE specific concept.`,
      
      text_snippet: `Create a ${difficulty} level ${subject} coding explanation that takes 60-90 seconds to read.
      Format as JSON with:
      {
        "title": "Clear, engaging title (max 50 chars)", 
        "content": "Well-structured explanation with examples",
        "codeExample": "Practical, working code example",
        "keyTakeaways": ["takeaway 1", "takeaway 2", "takeaway 3"],
        "difficulty": "${difficulty}",
        "estimatedReadTime": 80,
        "tags": ["${subject}", "${difficulty}", "snippet"]
      }
      Focus on one specific concept with practical application. Make it concise and valuable.`
    };

    const results = [];
    
    for (let i = 0; i < count; i++) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompts[contentType as keyof typeof prompts]
              }]
            }],
            generationConfig: {
              temperature: 0.8,
              topP: 0.9,
              topK: 40,
              maxOutputTokens: 1024,
            }
          }),
        });

        if (!response.ok) {
          console.error(`Gemini API Error for item ${i + 1}:`, await response.text());
          continue;
        }

        const data = await response.json();
        const generatedText = data.candidates[0].content.parts[0].text;
        
        // Parse and validate JSON response
        let parsedContent;
        try {
          parsedContent = JSON.parse(generatedText);
        } catch (parseError) {
          console.error(`Failed to parse JSON for item ${i + 1}:`, parseError);
          continue;
        }

        // Add thumbnail for video content
        const thumbnailUrl = contentType === 'video_script' 
          ? `https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=600&fit=crop&auto=format&q=80&sig=${Math.random()}`
          : null;

        // Insert into content pool
        const { data: insertedContent, error: insertError } = await supabase
          .from('ai_content_pool')
          .insert({
            subject: subject.toLowerCase(),
            difficulty_level: difficulty,
            content_type: contentType,
            title: parsedContent.title,
            content: parsedContent.content || parsedContent.script,
            code_examples: { 
              example: parsedContent.codeExample,
              language: getLanguageFromSubject(subject)
            },
            estimated_duration: parsedContent.estimatedDuration || parsedContent.estimatedReadTime,
            tags: parsedContent.keyPoints || parsedContent.keyTakeaways || parsedContent.tags || [subject, difficulty],
            thumbnail_url: thumbnailUrl
          })
          .select()
          .single();

        if (insertError) {
          console.error(`Database insert error for item ${i + 1}:`, insertError);
          continue;
        }

        results.push(insertedContent);
        console.log(`Successfully generated and stored content item ${i + 1}`);

      } catch (error) {
        console.error(`Error generating content item ${i + 1}:`, error);
        continue;
      }
    }

    console.log(`Successfully generated ${results.length} out of ${count} requested items`);

    return new Response(JSON.stringify({ 
      success: true,
      generated: results.length,
      requested: count,
      content: results 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-content function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getLanguageFromSubject(subject: string): string {
  const languageMap: Record<string, string> = {
    'javascript': 'javascript',
    'python': 'python',
    'react': 'javascript',
    'typescript': 'typescript',
    'java': 'java',
    'cpp': 'cpp',
    'csharp': 'csharp',
    'go': 'go',
    'rust': 'rust',
    'php': 'php',
    'ruby': 'ruby',
    'swift': 'swift',
    'kotlin': 'kotlin'
  };
  
  return languageMap[subject.toLowerCase()] || 'javascript';
}