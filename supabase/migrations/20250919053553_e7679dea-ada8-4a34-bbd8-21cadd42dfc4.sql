-- Create profiles table for users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  preferred_subjects TEXT[] DEFAULT ARRAY['javascript', 'python', 'react'],
  preferred_difficulty TEXT DEFAULT 'beginner',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Content generation tracking
CREATE TABLE public.content_generation (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(user_id),
  subject TEXT NOT NULL,
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  content_type TEXT NOT NULL CHECK (content_type IN ('video_script', 'text_snippet')),
  generated_count INTEGER DEFAULT 0,
  last_generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  next_generation_threshold INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_generation ENABLE ROW LEVEL SECURITY;

-- Content generation policies
CREATE POLICY "Users can view their own generation tracking" 
ON public.content_generation 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generation tracking" 
ON public.content_generation 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generation tracking" 
ON public.content_generation 
FOR UPDATE 
USING (auth.uid() = user_id);

-- AI Generated Content Pool
CREATE TABLE public.ai_content_pool (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  content_type TEXT NOT NULL CHECK (content_type IN ('video_script', 'text_snippet')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  code_examples JSONB,
  estimated_duration INTEGER,
  tags TEXT[],
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by_ai_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  used_count INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.ai_content_pool ENABLE ROW LEVEL SECURITY;

-- AI content pool policies (everyone can read active content)
CREATE POLICY "Active content is viewable by everyone" 
ON public.ai_content_pool 
FOR SELECT 
USING (is_active = true);

-- User content consumption tracking
CREATE TABLE public.user_content_consumption (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES public.ai_content_pool(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  difficulty_level TEXT NOT NULL,
  consumed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  liked BOOLEAN DEFAULT false,
  bookmarked BOOLEAN DEFAULT false,
  shared BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.user_content_consumption ENABLE ROW LEVEL SECURITY;

-- User consumption policies
CREATE POLICY "Users can view their own consumption" 
ON public.user_content_consumption 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own consumption" 
ON public.user_content_consumption 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own consumption" 
ON public.user_content_consumption 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_ai_content_pool_subject_difficulty ON public.ai_content_pool(subject, difficulty_level, is_active);
CREATE INDEX idx_user_content_consumption_user_subject ON public.user_content_consumption(user_id, subject, difficulty_level);
CREATE INDEX idx_content_generation_user_subject ON public.content_generation(user_id, subject, difficulty_level);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates on profiles
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.raw_user_meta_data ->> 'name', 'Anonymous'),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();