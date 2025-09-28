-- CodeSnap Database Setup Script
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/mmwtiqhowrconndntekz/sql

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (be careful in production!)
DROP TABLE IF EXISTS user_content_consumption CASCADE;
DROP TABLE IF EXISTS ai_content_pool CASCADE;
DROP TABLE IF EXISTS content_generation CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
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
  user_id uuid references auth.users(id) on delete cascade,
  content_id uuid not null,
  subject text not null,
  difficulty_level text not null,
  consumed_at timestamp with time zone default now(),
  completion_percentage integer default 0
);

-- Content generation tracking
CREATE TABLE content_generation (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  subject text not null, -- 'javascript', 'python', 'react', etc.
  difficulty_level text not null, -- 'beginner', 'intermediate', 'advanced'
  content_type text not null, -- 'video_script', 'text_snippet'
  generated_count integer default 0,
  last_generated_at timestamp with time zone default now(),
  next_generation_threshold integer default 10 -- Generate when user consumes this many
);

-- User preferences
CREATE TABLE user_preferences (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade unique,
  preferred_subjects text[] default '{"javascript", "react", "python"}',
  preferred_difficulty text default 'intermediate',
  daily_content_goal integer default 10,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_content_pool_subject_difficulty 
ON ai_content_pool(subject, difficulty_level, is_active);

CREATE INDEX IF NOT EXISTS idx_user_content_consumption_user_subject 
ON user_content_consumption(user_id, subject, difficulty_level);

CREATE INDEX IF NOT EXISTS idx_content_generation_user_subject 
ON content_generation(user_id, subject, difficulty_level);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_content_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_content_consumption ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_generation ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can view active content" ON ai_content_pool;
DROP POLICY IF EXISTS "Users can view own consumption" ON user_content_consumption;
DROP POLICY IF EXISTS "Users can insert consumption" ON user_content_consumption;
DROP POLICY IF EXISTS "Users can view own generation" ON content_generation;
DROP POLICY IF EXISTS "Users can insert generation" ON content_generation;
DROP POLICY IF EXISTS "Users can view preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update preferences" ON user_preferences;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can view active content" ON ai_content_pool FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view own consumption" ON user_content_consumption FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert consumption" ON user_content_consumption FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own generation" ON content_generation FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert generation" ON content_generation FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view preferences" ON user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert preferences" ON user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update preferences" ON user_preferences FOR UPDATE USING (auth.uid() = user_id);

-- Create function to handle new user creation
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

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- Insert comprehensive sample content for testing
INSERT INTO ai_content_pool (subject, difficulty_level, content_type, title, content, code_examples, estimated_duration, tags) VALUES
-- JavaScript Content
(
  'javascript',
  'beginner',
  'video_script',
  'JavaScript Variables Explained',
  'Welcome to JavaScript fundamentals! Today we''re learning about variables - the building blocks of any program. Variables are like containers that store data values. In JavaScript, we can declare variables using let, const, or var. Let me show you the differences and when to use each one.',
  '{"example": "// Variable declarations\nlet name = ''John'';\nconst age = 25;\nvar city = ''New York'';\n\n// Variables can change (except const)\nname = ''Jane'';\nconsole.log(name); // Jane"}',
  75,
  ARRAY['Variable declarations', 'let vs const vs var', 'Best practices']
),
(
  'javascript',
  'intermediate',
  'text_snippet',
  'Master JavaScript Async/Await',
  'Async/await is a powerful feature that makes asynchronous code look and behave more like synchronous code. It''s built on top of Promises and provides a cleaner way to handle asynchronous operations. Instead of chaining .then() calls, you can write code that reads from top to bottom.',
  '{"example": "// Async/await example\nasync function fetchUserData(id) {\n  try {\n    const response = await fetch(`/api/users/${id}`);\n    const user = await response.json();\n    return user;\n  } catch (error) {\n    console.error(''Error fetching user:'', error);\n  }\n}"}',
  90,
  ARRAY['Async functions', 'Error handling', 'Promise-based code']
),
(
  'javascript',
  'advanced',
  'video_script',
  'JavaScript Closures Deep Dive',
  'Closures are one of JavaScript''s most powerful features, yet they often confuse developers. A closure gives you access to an outer function''s scope from an inner function. This creates a persistent scope that can be incredibly useful for data privacy and function factories.',
  '{"example": "// Closure example\nfunction createCounter() {\n  let count = 0;\n  \n  return function() {\n    count++;\n    return count;\n  };\n}\n\nconst counter = createCounter();\nconsole.log(counter()); // 1\nconsole.log(counter()); // 2"}',
  95,
  ARRAY['Closures', 'Scope', 'Advanced concepts']
),

-- React Content
(
  'react',
  'beginner',
  'video_script',
  'React useState Hook Basics',
  'The useState hook is your gateway to adding state to functional components. Before hooks, you needed class components for state management. Now, with useState, you can add reactive state to any functional component. Let''s see how it works and why it''s so powerful.',
  '{"example": "import React, { useState } from ''react'';\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div>\n      <p>Count: {count}</p>\n      <button onClick={() => setCount(count + 1)}>\n        Increment\n      </button>\n    </div>\n  );\n}"}',
  80,
  ARRAY['State management', 'Functional components', 'React hooks']
),
(
  'react',
  'intermediate',
  'text_snippet',
  'React useEffect Hook Mastery',
  'The useEffect hook lets you perform side effects in functional components. It serves the same purpose as componentDidMount, componentDidUpdate, and componentWillUnmount combined in React classes. Understanding useEffect is crucial for managing component lifecycle.',
  '{"example": "import React, { useState, useEffect } from ''react'';\n\nfunction UserProfile({ userId }) {\n  const [user, setUser] = useState(null);\n  const [loading, setLoading] = useState(true);\n\n  useEffect(() => {\n    fetchUser(userId)\n      .then(setUser)\n      .finally(() => setLoading(false));\n  }, [userId]); // Dependency array\n\n  if (loading) return <div>Loading...</div>;\n  return <div>Hello, {user?.name}!</div>;\n}"}',
  85,
  ARRAY['useEffect', 'Side effects', 'Component lifecycle']
),
(
  'react',
  'advanced',
  'video_script',
  'Custom React Hooks Pattern',
  'Custom hooks are the secret to reusable logic in React. They let you extract component logic into reusable functions. Any function that starts with "use" and calls other hooks is a custom hook. This pattern helps you share stateful logic between components without changing their hierarchy.',
  '{"example": "// Custom hook for API calls\nfunction useApi(url) {\n  const [data, setData] = useState(null);\n  const [loading, setLoading] = useState(true);\n  const [error, setError] = useState(null);\n\n  useEffect(() => {\n    fetch(url)\n      .then(res => res.json())\n      .then(setData)\n      .catch(setError)\n      .finally(() => setLoading(false));\n  }, [url]);\n\n  return { data, loading, error };\n}"}',
  95,
  ARRAY['Custom hooks', 'Reusable logic', 'Advanced patterns']
),

-- Python Content
(
  'python',
  'beginner',
  'text_snippet',
  'Python Variables and Data Types',
  'Python is dynamically typed, which means you don''t need to declare variable types explicitly. Python automatically determines the type based on the value you assign. Let''s explore the basic data types and how to work with variables effectively.',
  '{"example": "# Python variables and types\nname = \"Alice\"  # String\nage = 25        # Integer\nheight = 5.6    # Float\nis_student = True  # Boolean\n\n# Python is dynamically typed\nprint(type(name))    # <class ''str''>\nprint(type(age))     # <class ''int''>\nprint(type(height))  # <class ''float''>"}',
  70,
  ARRAY['Variables', 'Data types', 'Dynamic typing']
),
(
  'python',
  'intermediate',
  'video_script',
  'Python List Comprehensions',
  'List comprehensions provide a concise way to create lists in Python. They''re more readable and often faster than traditional for loops. You can filter, transform, and create new lists in a single line of code. This Pythonic approach makes your code more elegant and efficient.',
  '{"example": "# Traditional approach\nnumbers = [1, 2, 3, 4, 5]\nsquares = []\nfor n in numbers:\n    if n % 2 == 0:\n        squares.append(n ** 2)\n\n# List comprehension\nsquares = [n ** 2 for n in numbers if n % 2 == 0]\nprint(squares)  # [4, 16]\n\n# More examples\nwords = [''hello'', ''world'', ''python'']\ncapitalized = [word.upper() for word in words]\nprint(capitalized)  # [''HELLO'', ''WORLD'', ''PYTHON'']"}',
  85,
  ARRAY['List comprehensions', 'Pythonic code', 'Performance optimization']
),
(
  'python',
  'advanced',
  'text_snippet',
  'Python Decorators Explained',
  'Decorators are a powerful feature in Python that allow you to modify or extend the behavior of functions or classes without permanently modifying their code. They''re essentially functions that take another function as an argument and return a modified version of that function.',
  '{"example": "# Simple decorator example\ndef timing_decorator(func):\n    import time\n    def wrapper(*args, **kwargs):\n        start = time.time()\n        result = func(*args, **kwargs)\n        end = time.time()\n        print(f\"{func.__name__} took {end - start:.4f} seconds\")\n        return result\n    return wrapper\n\n@timing_decorator\ndef slow_function():\n    import time\n    time.sleep(1)\n    return \"Done!\"\n\nresult = slow_function()  # Prints timing info"}',
  100,
  ARRAY['Decorators', 'Function modification', 'Advanced Python']
),

-- TypeScript Content
(
  'typescript',
  'beginner',
  'video_script',
  'TypeScript Basics: Types and Interfaces',
  'TypeScript adds static type checking to JavaScript, helping you catch errors before runtime. Types make your code more predictable and easier to debug. Let''s explore basic types and how they make your JavaScript code more robust.',
  '{"example": "// Basic TypeScript types\nlet name: string = \"John\";\nlet age: number = 30;\nlet isActive: boolean = true;\n\n// Interface example\ninterface User {\n  id: number;\n  name: string;\n  email: string;\n}\n\nconst user: User = {\n  id: 1,\n  name: \"Alice\",\n  email: \"alice@example.com\"\n};"}',
  80,
  ARRAY['TypeScript basics', 'Type safety', 'Interfaces']
),
(
  'typescript',
  'intermediate',
  'text_snippet',
  'TypeScript Generics Made Simple',
  'Generics allow you to create reusable components that work with multiple types while maintaining type safety. They''re like variables for types - you can define a component once and use it with different types. This makes your code more flexible and reusable.',
  '{"example": "// Generic function\nfunction identity<T>(arg: T): T {\n  return arg;\n}\n\n// Usage with different types\nlet stringResult = identity<string>(\"hello\");\nlet numberResult = identity<number>(42);\n\n// Generic interface\ninterface ApiResponse<T> {\n  data: T;\n  status: number;\n  message: string;\n}\n\n// Usage\nconst userResponse: ApiResponse<User> = {\n  data: { id: 1, name: \"John\" },\n  status: 200,\n  message: \"Success\"\n};"}',
  90,
  ARRAY['Generics', 'Type parameters', 'Reusable code']
),
(
  'typescript',
  'advanced',
  'video_script',
  'Advanced TypeScript: Utility Types',
  'TypeScript provides several utility types that help you transform existing types. These built-in type helpers like Partial, Pick, Omit, and Record can save you time and make your type definitions more maintainable. Let''s explore how to use them effectively.',
  '{"example": "// Utility types in action\ninterface User {\n  id: number;\n  name: string;\n  email: string;\n  age: number;\n}\n\n// Partial - makes all properties optional\ntype PartialUser = Partial<User>;\n\n// Pick - select specific properties\ntype UserSummary = Pick<User, ''id'' | ''name''>;\n\n// Omit - exclude specific properties\ntype CreateUser = Omit<User, ''id''>;\n\n// Record - create object type with specific keys\ntype UserRoles = Record<string, ''admin'' | ''user'' | ''guest''>;"}',
  95,
  ARRAY['Utility types', 'Type transformations', 'Advanced TypeScript']
);

-- Success message
SELECT 'CodeSnap database setup completed successfully! 🎉' as message;