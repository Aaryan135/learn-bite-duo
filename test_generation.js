// Test script to verify content generation
// Run this in browser console to test the Edge Function

async function testContentGeneration() {
  const supabaseUrl = 'https://mmwtiqhowrconndntekz.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1td3RpcWhvd3Jjb25uZG50ZWt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxOTgwNTksImV4cCI6MjA3Mzc3NDA1OX0.yhkBJ4ddRUqX0afPZTy7tAnedDKgL7EBcXYHD-TwbHY';
  
  try {
    console.log('Testing content generation...');
    
    const response = await fetch(`${supabaseUrl}/functions/v1/generate-content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        subject: 'javascript',
        difficulty: 'intermediate',
        contentType: 'video_script',
        count: 2
      })
    });
    
    const result = await response.json();
    console.log('Generation result:', result);
    
    if (result.success) {
      console.log(`✅ Successfully generated ${result.generated} pieces of content!`);
    } else {
      console.error('❌ Generation failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testContentGeneration();