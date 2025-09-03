#!/bin/bash

echo "🚀 Setting up Shape AI Environment"
echo "========================================"

# Check if .env exists
if [ -f ".env" ]; then
    echo "✅ .env already exists"
else
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend API URL
API_URL=http://localhost:8001
EOF
    echo "✅ Created .env file"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Get your Supabase credentials from https://supabase.com"
echo "2. Update .env with your actual values"
echo "3. Make sure your backend is running on port 8001"
echo "4. Run 'npm run dev' to start the frontend"
echo ""
echo "🔗 Supabase Setup Guide:"
echo "- Go to https://supabase.com"
echo "- Create a new project"
echo "- Go to Settings → API"
echo "- Copy Project URL and anon key"
echo "- Update .env with these values"
echo ""
echo "🎉 Setup complete! Happy coding!"
