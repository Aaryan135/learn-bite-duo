-- Create CodeSnap specific tables
-- Drop existing tables if they exist to avoid conflicts
DROP TABLE IF EXISTS user_content_consumption CASCADE;
DROP TABLE IF EXISTS ai_content_pool CASCADE;
DROP TABLE IF EXISTS content_generation CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;

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
  user_id uuid not null, -- references auth.users(id) but no foreign key for simplicity
  content_id uuid not null,
  subject text not null,
  difficulty_level text not null,
  consumed_at timestamp with time zone default now(),
  completion_percentage integer default 0
);

-- Content generation tracking
CREATE TABLE content_generation (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null, -- references auth.users(id) but no foreign key for simplicity
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
  user_id uuid not null unique, -- references auth.users(id) but no foreign key for simplicity
  preferred_subjects text[] default '{"javascript", "react", "python"}',
  preferred_difficulty text default 'intermediate',
  daily_content_goal integer default 10,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security
ALTER TABLE ai_content_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_content_consumption ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_generation ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Simple policies that work with anonymous users
CREATE POLICY "Anyone can view active content" ON ai_content_pool FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view own consumption" ON user_content_consumption FOR SELECT USING (true);
CREATE POLICY "Users can insert consumption" ON user_content_consumption FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own generation" ON content_generation FOR SELECT USING (true);
CREATE POLICY "Users can insert generation" ON content_generation FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view preferences" ON user_preferences FOR SELECT USING (true);
CREATE POLICY "Users can insert preferences" ON user_preferences FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update preferences" ON user_preferences FOR UPDATE USING (true);

-- Insert sample content for testing
INSERT INTO ai_content_pool (subject, difficulty_level, content_type, title, content, code_examples, estimated_duration, tags) VALUES
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
  'python',
  'intermediate',
  'text_snippet',
  'Python List Comprehensions',
  'List comprehensions provide a concise way to create lists in Python. They''re more readable and often faster than traditional for loops. You can filter, transform, and create new lists in a single line of code. This Pythonic approach makes your code more elegant and efficient.',
  '{"example": "# Traditional approach\nnumbers = [1, 2, 3, 4, 5]\nsquares = []\nfor n in numbers:\n    if n % 2 == 0:\n        squares.append(n ** 2)\n\n# List comprehension\nsquares = [n ** 2 for n in numbers if n % 2 == 0]\nprint(squares)  # [4, 16]"}',
  85,
  ARRAY['List comprehensions', 'Pythonic code', 'Performance optimization']
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
);