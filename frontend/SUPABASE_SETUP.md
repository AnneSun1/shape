# Supabase Authentication Setup

## Environment Variables

Create a `.env` file in your frontend root directory with the following variables:

```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend API URL
API_URL=http://localhost:8001
```

## How to Get Supabase Credentials

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in your project details
5. Wait for the project to be created

### 2. Get Your Project URL and API Key
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the **Project URL** (this is your `NEXT_PUBLIC_SUPABASE_URL`)
3. Copy the **anon public** key (this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

### 3. Update Your Backend Environment
Make sure your backend `.env` file has the same Supabase credentials:

```bash
SUPABASE_PROJECT_REF=your_project_ref
SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_database_url
```

## Usage

### 1. Wrap Your App with AuthProvider
```tsx
import { AuthProvider } from '@/components/AuthProvider';

function App() {
  return (
    <AuthProvider>
      {/* Your app components */}
    </AuthProvider>
  );
}
```

### 2. Use the Auth Hook
```tsx
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { login, signup, logout, user, isAuthenticated } = useAuth();
  
  // Your component logic
}
```

### 3. Use the AuthForm Component
```tsx
import { AuthForm } from '@/components/AuthForm';

function LoginPage() {
  return <AuthForm />;
}
```

## Features

✅ **Email/Password Authentication**
✅ **Automatic Session Management**
✅ **Real-time Auth State Changes**
✅ **Token Management for API Calls**
✅ **Error Handling**
✅ **Loading States**

## Security Notes

- Never expose your Supabase service role key in the frontend
- Only use the anon key for client-side operations
- The backend will handle server-side operations with the service role key
