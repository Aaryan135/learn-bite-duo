-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Content generation tracking
CREATE TABLE content_generation (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id),
  subject text not null, -- 'javascript', 'python', 'react', etc.
  difficulty_level text not null, -- 'beginner', 'intermediate', 'advanced'
  content_type text not null, -- 'video_script', 'text_snippet'
  generated_count integer default 0,
  last_generated_at timestamp with time zone default now(),
  next_generation_threshold integer default 10 -- Generate when user consumes this many
);

-- AI Generated Content Pool
CREATE TABLE ai_content_pool (
  id uuid default gen_random_uuid() primary key,
  subject text not null,
  difficulty_level text not null,
  content_type text not null, -- 'video_script', 'text_snippet'
  title text not null,
  content text not null, -- Generated content from Gemini
  code_examples jsonb,
  estimated_duration integer, -- in seconds
  tags text[],
  is_active boolean default true,
  created_by_ai_at timestamp with time zone default now(),
  used_count integer default 0 -- Track how many users have seen this
);

-- User content consumption tracking
CREATE TABLE user_content_consumption (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id),
  content_id uuid not null,
  subject text not null,
  difficulty_level text not null,
  consumed_at timestamp with time zone default now(),
  completion_percentage integer default 0
);

-- User preferences
CREATE TABLE user_preferences (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) unique,
  preferred_subjects text[] default '{"javascript", "react", "python"}',
  preferred_difficulty text default 'intermediate',
  daily_content_goal integer default 10,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_generation ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_content_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_content_consumption ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view all active content" ON ai_content_pool FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view own consumption" ON user_content_consumption FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own consumption" ON user_content_consumption FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own preferences" ON user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON user_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  
  INSERT INTO public.user_preferences (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();