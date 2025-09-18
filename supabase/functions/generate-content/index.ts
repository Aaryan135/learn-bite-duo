import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subject, type, difficulty } = await req.json();
    
    if (!subject) {
      return new Response(JSON.stringify({ error: 'Subject is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Create appropriate prompts based on content type
    let prompt = '';
    if (type === 'video') {
      prompt = `Create a concise, engaging video script about ${subject} for a ${difficulty} level programmer. 
      The content should be 60-90 seconds worth of material, include practical code examples, 
      and be structured for a TikTok-style short video format. Focus on one key concept with clear explanations.
      Format: Return JSON with title, script, and key_points array.`;
    } else {
      prompt = `Create a digestible coding snippet explanation about ${subject} for a ${difficulty} level programmer.
      Include a practical code example with clear explanations. Keep it concise but comprehensive.
      Format: Return JSON with title, explanation, code_example, and estimated_read_time (in minutes).`;
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 1024,
        }
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Gemini API Error:', error);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;
    
    // Try to parse as JSON, if it fails return as plain text
    let parsedContent;
    try {
      parsedContent = JSON.parse(generatedText);
    } catch {
      // If JSON parsing fails, create a structured response
      parsedContent = {
        title: `${subject} - ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Guide`,
        content: generatedText,
        type: type,
        difficulty: difficulty,
        category: subject.toLowerCase()
      };
    }

    // Add metadata
    parsedContent.id = crypto.randomUUID();
    parsedContent.type = type;
    parsedContent.difficulty = difficulty;
    parsedContent.category = subject.toLowerCase();
    parsedContent.likes = Math.floor(Math.random() * 500) + 50; // Random likes for demo
    parsedContent.isBookmarked = false;
    parsedContent.created_at = new Date().toISOString();

    // Add type-specific fields
    if (type === 'video') {
      parsedContent.thumbnail = `https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=225&fit=crop&auto=format&q=80`;
      parsedContent.duration = Math.floor(Math.random() * 30) + 60; // 60-90 seconds
    } else {
      parsedContent.readTime = Math.floor(Math.random() * 3) + 2; // 2-5 minutes
      if (!parsedContent.code_example && !parsedContent.preview) {
        parsedContent.preview = parsedContent.explanation || parsedContent.content;
      }
    }

    console.log('Generated content:', parsedContent);

    return new Response(JSON.stringify({ content: parsedContent }), {
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