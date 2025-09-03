#!/usr/bin/env python3
"""
Setup script for pgvector database schema
"""

import os
import sys
from pathlib import Path
from sqlalchemy import text
from app.db.base import SessionLocal

def setup_pgvector():
    """Set up pgvector database schema"""
    print("🔧 Setting up pgvector database schema...")
    
    db = SessionLocal()
    try:
        # Enable pgvector extension
        print("📦 Enabling pgvector extension...")
        db.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        
        # Create documents table
        print("📋 Creating documents table...")
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS documents (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
                content TEXT NOT NULL,
                embedding vector(384),
                metadata JSONB DEFAULT '{}',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        """))
        
        # Create indexes
        print("🔍 Creating indexes...")
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS documents_embedding_idx 
            ON documents USING hnsw (embedding vector_cosine_ops) 
            WITH (m = 16, ef_construction = 64)
        """))
        
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS documents_user_id_idx 
            ON documents (user_id)
        """))
        
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS documents_created_at_idx 
            ON documents (created_at)
        """))
        
        # Create updated_at trigger
        print("⏰ Creating updated_at trigger...")
        db.execute(text("""
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = NOW();
                RETURN NEW;
            END;
            $$ language 'plpgsql'
        """))
        
        db.execute(text("""
            DROP TRIGGER IF EXISTS update_documents_updated_at ON documents
        """))
        
        db.execute(text("""
            CREATE TRIGGER update_documents_updated_at 
                BEFORE UPDATE ON documents 
                FOR EACH ROW 
                EXECUTE FUNCTION update_updated_at_column()
        """))
        
        # Enable RLS
        print("🔒 Enabling Row Level Security...")
        db.execute(text("ALTER TABLE documents ENABLE ROW LEVEL SECURITY"))
        
        # Create RLS policies
        print("📜 Creating RLS policies...")
        db.execute(text("""
            DROP POLICY IF EXISTS "Users can view their own documents" ON documents
        """))
        db.execute(text("""
            CREATE POLICY "Users can view their own documents" ON documents
                FOR SELECT USING (auth.uid() = user_id)
        """))
        
        db.execute(text("""
            DROP POLICY IF EXISTS "Users can insert their own documents" ON documents
        """))
        db.execute(text("""
            CREATE POLICY "Users can insert their own documents" ON documents
                FOR INSERT WITH CHECK (auth.uid() = user_id)
        """))
        
        db.execute(text("""
            DROP POLICY IF EXISTS "Users can update their own documents" ON documents
        """))
        db.execute(text("""
            CREATE POLICY "Users can update their own documents" ON documents
                FOR UPDATE USING (auth.uid() = user_id)
        """))
        
        db.execute(text("""
            DROP POLICY IF EXISTS "Users can delete their own documents" ON documents
        """))
        db.execute(text("""
            CREATE POLICY "Users can delete their own documents" ON documents
                FOR DELETE USING (auth.uid() = user_id)
        """))
        
        db.commit()
        print("✅ Database schema setup completed successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error setting up database schema: {str(e)}")
        raise
    finally:
        db.close()

def verify_setup():
    """Verify the setup was successful"""
    print("\n🔍 Verifying setup...")
    
    db = SessionLocal()
    try:
        # Check if vector extension exists
        result = db.execute(text("SELECT * FROM pg_extension WHERE extname = 'vector'"))
        if result.fetchone():
            print("✅ pgvector extension is enabled")
        else:
            print("❌ pgvector extension not found")
            return False
        
        # Check if documents table exists
        result = db.execute(text("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'documents'
            )
        """))
        if result.fetchone()[0]:
            print("✅ documents table exists")
        else:
            print("❌ documents table not found")
            return False
        
        # Check if indexes exist
        result = db.execute(text("""
            SELECT indexname FROM pg_indexes 
            WHERE tablename = 'documents' 
            AND indexname LIKE '%embedding%'
        """))
        if result.fetchone():
            print("✅ vector indexes exist")
        else:
            print("❌ vector indexes not found")
            return False
        
        print("✅ All verifications passed!")
        return True
        
    except Exception as e:
        print(f"❌ Error verifying setup: {str(e)}")
        return False
    finally:
        db.close()

if __name__ == "__main__":
    # Add the app directory to the Python path
    sys.path.append(str(Path(__file__).parent / "app"))
    
    try:
        setup_pgvector()
        verify_setup()
        print("\n🎉 pgvector setup completed successfully!")
        print("\nNext steps:")
        print("1. Update your .env file with Supabase credentials")
        print("2. Run: python test_rag.py")
        print("3. Start your server: uvicorn app.main:app --reload")
        
    except Exception as e:
        print(f"\n❌ Setup failed: {str(e)}")
        sys.exit(1)
