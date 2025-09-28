# Google OAuth Setup for CodeSnap

## 🔧 Supabase Configuration

### 1. Enable Google OAuth in Supabase
1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/mmwtiqhowrconndntekz/auth/providers
2. Find "Google" in the Auth Providers list
3. Toggle it **ON**
4. You'll need to configure the Google OAuth credentials

### 2. Create Google OAuth App
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `https://mmwtiqhowrconndntekz.supabase.co/auth/v1/callback`
     - `http://localhost:5173/auth/callback` (for development)

### 3. Configure Supabase with Google Credentials
1. Copy the **Client ID** and **Client Secret** from Google Cloud Console
2. In Supabase Auth Providers > Google:
   - Paste **Client ID**
   - Paste **Client Secret**
   - Set **Redirect URL**: `https://mmwtiqhowrconndntekz.supabase.co/auth/v1/callback`
3. Click **Save**

### 4. Update Site URL (Important!)
1. Go to Supabase Dashboard > Auth > Settings
2. Set **Site URL** to your domain:
   - Development: `http://localhost:5173`
   - Production: `https://your-domain.com`
3. Add **Redirect URLs**:
   - `http://localhost:5173/auth/callback`
   - `https://your-domain.com/auth/callback`

## 🚀 Testing Authentication

### Available Auth Methods:
1. **Google OAuth** - One-click sign in with Google account
2. **Email/Password** - Traditional signup with email verification
3. **Guest Mode** - Anonymous authentication for immediate access

### Auth Flow:
1. User clicks "Start Learning" on home page
2. Auth modal opens with three options
3. After successful auth, user proceeds to reels
4. User info shows in header with sign out option

## 🔒 Security Features

- **Row Level Security (RLS)** enabled on all tables
- **Email verification** required for email signups
- **Secure password requirements** (minimum 6 characters)
- **Anonymous users** can access content but can't save progress
- **Google OAuth** provides secure, verified accounts

## 🎯 User Experience

- **Seamless onboarding** - users can start immediately as guests
- **Progress saving** - authenticated users get personalized experience
- **Account switching** - easy to switch between accounts
- **Persistent sessions** - users stay logged in across visits

## 📱 Mobile Support

- **Responsive design** - auth modal works on all screen sizes
- **Touch-friendly** - optimized for mobile interactions
- **PWA ready** - can be installed as mobile app

Once you complete the Google OAuth setup in Supabase, users will be able to:
- Sign in with their Google accounts instantly
- Create accounts with email/password
- Continue as guests without signing up
- Have their learning progress saved and synced