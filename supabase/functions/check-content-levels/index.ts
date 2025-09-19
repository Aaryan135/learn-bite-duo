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
    const { userId, subject, difficulty } = await req.json();
    
    if (!userId || !subject || !difficulty) {
      return new Response(JSON.stringify({ error: 'UserId, subject, and difficulty are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Checking content levels for user ${userId}, subject: ${subject}, difficulty: ${difficulty}`);

    // Check user's consumption count for this subject/difficulty
    const { data: consumption, error: consumptionError } = await supabase
      .from('user_content_consumption')
      .select('*')
      .eq('user_id', userId)
      .eq('subject', subject.toLowerCase())
      .eq('difficulty_level', difficulty);

    if (consumptionError) {
      console.error('Error fetching consumption data:', consumptionError);
      throw consumptionError;
    }

    // Check available content in pool
    const { data: availableContent, error: contentError } = await supabase
      .from('ai_content_pool')
      .select('*')
      .eq('subject', subject.toLowerCase())
      .eq('difficulty_level', difficulty)
      .eq('is_active', true)
      .lt('used_count', 10); // Content that hasn't been shown to too many users

    if (contentError) {
      console.error('Error fetching available content:', contentError);
      throw contentError;
    }

    const consumptionCount = consumption?.length || 0;
    const availableCount = availableContent?.length || 0;

    console.log(`User has consumed ${consumptionCount} items, ${availableCount} available in pool`);

    // If user has consumed 5+ pieces and we have less than 8 unused pieces, generate more
    if (consumptionCount >= 5 && availableCount < 8) {
      console.log('Triggering background content generation');

      // Randomly choose content types to generate
      const contentTypes = ['video_script', 'text_snippet'];
      const randomContentType = contentTypes[Math.floor(Math.random() * contentTypes.length)];

      // Call the generate-content function
      const generateResponse = await supabase.functions.invoke('generate-content', {
        body: {
          subject: subject.toLowerCase(),
          difficulty,
          contentType: randomContentType,
          count: 10 // Generate 10 new pieces
        }
      });

      if (generateResponse.error) {
        console.error('Error generating content:', generateResponse.error);
      } else {
        console.log(`Successfully triggered generation of ${generateResponse.data?.generated || 0} content items`);
      }

      // Update content generation tracking
      await supabase
        .from('content_generation')
        .upsert({
          user_id: userId,
          subject: subject.toLowerCase(),
          difficulty_level: difficulty,
          content_type: randomContentType,
          generated_count: (await supabase
            .from('content_generation')
            .select('generated_count')
            .eq('user_id', userId)
            .eq('subject', subject.toLowerCase())
            .eq('difficulty_level', difficulty)
            .single()).data?.generated_count || 0 + 10,
          last_generated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,subject,difficulty_level,content_type'
        });

      return new Response(JSON.stringify({ 
        message: 'Content generation triggered', 
        consumptionCount,
        availableCount,
        generated: generateResponse.data?.generated || 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({ 
        message: 'No generation needed', 
        consumptionCount,
        availableCount 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in check-content-levels function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});