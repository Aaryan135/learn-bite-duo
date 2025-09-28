# CodeSnap Complete Setup Guide

## 🚀 Quick Setup Steps

### 1. Database Setup
1. Go to your Supabase SQL Editor: https://supabase.com/dashboard/project/mmwtiqhowrconndntekz/sql
2. Copy and paste the entire content from `setup_codesnap_database.sql`
3. Click "Run" to execute the script
4. You should see "CodeSnap database setup completed successfully! 🎉"

### 2. Enable Anonymous Authentication (Optional)
1. Go to Authentication settings: https://supabase.com/dashboard/project/mmwtiqhowrconndntekz/auth/settings
2. Scroll down to "Anonymous sign-ins"
3. Toggle it ON
4. Click "Save"

### 3. Set Up Gemini AI (Optional but Recommended)
1. Get a Gemini API key from: https://makersuite.google.com/app/apikey
2. Go to your Supabase Edge Functions settings: https://supabase.com/dashboard/project/mmwtiqhowrconndntekz/functions
3. Click on "Environment Variables"
4. Add a new variable:
   - Name: `GEMINI_API_KEY`
   - Value: Your Gemini API key
5. Click "Save"

### 4. Test the Setup
1. Restart your development server: `npm run dev`
2. Click "Start Learning"
3. You should now see real content from the database!

## 🎯 What's Now Working

### ✅ Real Database Integration
- Content is now stored and retrieved from Supabase
- User consumption tracking
- Real-time content pool management

### ✅ AI Content Generation
- Edge Functions deployed and ready
- Automatic content generation when pool runs low
- Gemini AI integration (when API key is provided)

### ✅ Smart Content Management
- Content automatically generates when you consume 5+ pieces
- Different content types (video scripts vs text snippets)
- Subject and difficulty-based content filtering

### ✅ User Analytics
- Tracks what content users consume
- Completion percentage tracking
- Usage-based content generation triggers

## 🔧 Advanced Configuration

### Environment Variables
Your `.env` file should have:
```env
VITE_SUPABASE_URL=https://mmwtiqhowrconndntekz.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

### Edge Function Environment Variables (Set in Supabase Dashboard)
- `GEMINI_API_KEY`: Your Google Gemini API key
- `SUPABASE_URL`: Automatically provided
- `SUPABASE_SERVICE_ROLE_KEY`: Automatically provided

## 🎨 Content Generation Prompts

The AI generates content using these prompts:

### Video Script Prompt:
```
Generate a [difficulty] level [subject] coding tutorial script for a 60-90 second video.
Format as JSON with title, script, codeExample, keyPoints, difficulty, and estimatedDuration.
Make it engaging, practical, and perfect for short-form video content.
```

### Text Snippet Prompt:
```
Create a [difficulty] level [subject] coding explanation that takes 60-90 seconds to read.
Format as JSON with title, content, codeExample, keyTakeaways, difficulty, and estimatedReadTime.
Focus on one specific concept with practical application.
```

## 🐛 Troubleshooting

### Database Connection Issues
- Make sure you ran the SQL setup script completely
- Check that RLS policies are enabled
- Verify your Supabase credentials in `.env`

### Content Not Loading
- Check browser console for errors
- Verify Edge Functions are deployed
- Make sure database tables exist

### AI Generation Not Working
- Ensure `GEMINI_API_KEY` is set in Supabase Edge Functions environment
- Check Edge Function logs in Supabase dashboard
- Fallback to mock content generation if API fails

## 📊 Monitoring

### Check Content Pool Status
```sql
SELECT subject, difficulty_level, COUNT(*) as content_count
FROM ai_content_pool 
WHERE is_active = true 
GROUP BY subject, difficulty_level;
```

### View User Consumption
```sql
SELECT subject, difficulty_level, COUNT(*) as consumed_count
FROM user_content_consumption 
GROUP BY subject, difficulty_level;
```

## 🎉 Success!

Once setup is complete, you'll have:
- ✅ Real database-backed content
- ✅ AI-powered content generation
- ✅ User tracking and analytics
- ✅ Automatic content pool management
- ✅ Instagram Reels-style learning experience

The app will now intelligently generate fresh content based on user behavior while keeping the AI completely hidden from the user experience!