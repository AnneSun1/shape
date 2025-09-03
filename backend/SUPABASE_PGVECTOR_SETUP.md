# Supabase + pgvector Setup Guide

This guide will help you set up pgvector with Supabase for your RAG pipeline.

## 🚀 Quick Start

### 1. Enable pgvector in Supabase

1. Go to your Supabase dashboard
2. Navigate to **Database** → **Extensions**
3. Search for `vector` and enable it
4. Click **Enable** to activate the pgvector extension

### 2. Create the Documents Table

Run this SQL in your Supabase SQL editor:

```sql
-- Enable the vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the documents table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding vector(384), -- Adjust dimension based on your embedding model
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for optimal performance
CREATE INDEX ON documents USING hnsw (embedding vector_cosine_ops) 
WITH (m = 16, ef_construction = 64);

CREATE INDEX ON documents (user_id);
CREATE INDEX ON documents (created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_documents_updated_at 
    BEFORE UPDATE ON documents 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own documents" ON documents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents" ON documents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" ON documents
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" ON documents
    FOR DELETE USING (auth.uid() = user_id);
```

### 3. Update Environment Variables

```env
# Vector Store Configuration
VECTOR_STORE_TYPE=pgvector

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
```

### 4. Update Database Configuration

Update your `app/core/config.py` to include Supabase settings:

```python
class Settings(BaseSettings):
    # ... existing settings ...
    
    # Supabase settings
    supabase_url: str = Field(..., env="SUPABASE_URL")
    supabase_key: str = Field(..., env="SUPABASE_KEY")
    
    # Vector store type
    vector_store_type: str = Field(default="chromadb", env="VECTOR_STORE_TYPE")
```

## 📊 Performance Optimization

### Index Configuration

```sql
-- For high-performance similarity search
CREATE INDEX ON documents USING hnsw (embedding vector_cosine_ops) 
WITH (m = 16, ef_construction = 64);

-- For exact search (slower but more accurate)
CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);
```

### Query Optimization

```sql
-- Example optimized query
SELECT 
    id, content, metadata,
    1 - (embedding <=> $1) as similarity
FROM documents 
WHERE user_id = $2
    AND 1 - (embedding <=> $1) > $3
ORDER BY embedding <=> $1
LIMIT $4;
```

## 🔧 Advanced Features

### Hybrid Search (Vector + Full-text)

```sql
-- Create full-text search index
CREATE INDEX ON documents USING gin(to_tsvector('english', content));

-- Hybrid search query
SELECT 
    id, content, metadata,
    1 - (embedding <=> $1) as vector_similarity,
    ts_rank(to_tsvector('english', content), plainto_tsquery('english', $2)) as text_rank
FROM documents 
WHERE user_id = $3
    AND (
        1 - (embedding <=> $1) > 0.5
        OR to_tsvector('english', content) @@ plainto_tsquery('english', $2)
    )
ORDER BY (vector_similarity * 0.7 + text_rank * 0.3) DESC
LIMIT 10;
```

### Metadata Filtering

```sql
-- Query with metadata filters
SELECT 
    id, content, metadata,
    1 - (embedding <=> $1) as similarity
FROM documents 
WHERE user_id = $2
    AND metadata->>'source' = $3
    AND metadata->>'document_id' = $4
    AND 1 - (embedding <=> $1) > $5
ORDER BY embedding <=> $1
LIMIT $6;
```

## 📈 Monitoring & Analytics

### Performance Queries

```sql
-- Check index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE tablename = 'documents';

-- Check table size
SELECT 
    pg_size_pretty(pg_total_relation_size('documents')) as total_size,
    pg_size_pretty(pg_relation_size('documents')) as table_size,
    pg_size_pretty(pg_relation_size('documents_embedding_idx')) as index_size;

-- Check query performance
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements 
WHERE query LIKE '%documents%'
ORDER BY total_time DESC;
```

## 🔒 Security Considerations

### Row Level Security (RLS)

```sql
-- Ensure RLS is enabled
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Verify policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'documents';
```

### API Key Management

```python
# In your FastAPI app
from supabase import create_client, Client

supabase: Client = create_client(
    os.environ.get("SUPABASE_URL"),
    os.environ.get("SUPABASE_KEY")
)
```

## 🚀 Deployment Considerations

### Supabase Limits

| Plan | Storage | Compute | Vector Operations |
|------|---------|---------|-------------------|
| Free | 500MB | 2GB RAM | Limited |
| Pro | 8GB | 8GB RAM | Full |
| Team | 100GB | 32GB RAM | Full |
| Enterprise | Custom | Custom | Full |

### Performance Tips

1. **Batch Operations**: Insert documents in batches of 100-1000
2. **Index Maintenance**: Rebuild indexes periodically
3. **Connection Pooling**: Use connection pooling for high traffic
4. **Caching**: Cache frequently accessed embeddings

### Migration from ChromaDB

```python
# Migration script
def migrate_from_chromadb_to_pgvector():
    # Export from ChromaDB
    chroma_docs = chroma_service.get_all_documents()
    
    # Import to pgvector
    for doc in chroma_docs:
        pgvector_service.add_documents([doc], doc['user_id'])
```

## 🔍 Troubleshooting

### Common Issues

1. **Extension Not Found**
   ```sql
   -- Check if vector extension is installed
   SELECT * FROM pg_extension WHERE extname = 'vector';
   ```

2. **Dimension Mismatch**
   ```sql
   -- Check embedding dimension
   SELECT array_length(embedding, 1) FROM documents LIMIT 1;
   ```

3. **Performance Issues**
   ```sql
   -- Analyze table statistics
   ANALYZE documents;
   
   -- Rebuild indexes
   REINDEX INDEX documents_embedding_idx;
   ```

4. **Memory Issues**
   ```sql
   -- Check memory usage
   SELECT 
       schemaname,
       tablename,
       attname,
       n_distinct,
       correlation
   FROM pg_stats 
   WHERE tablename = 'documents';
   ```

## 📊 Comparison: ChromaDB vs pgvector

| Feature | ChromaDB | pgvector + Supabase |
|---------|----------|---------------------|
| **Setup** | Simple | Requires PostgreSQL |
| **Scalability** | Medium | High |
| **ACID** | No | Yes |
| **Backup** | Manual | Automatic |
| **Security** | Basic | Enterprise-grade |
| **Cost** | Free | Supabase pricing |
| **Performance** | Good | Excellent |
| **SQL** | No | Full SQL support |

## 🎯 When to Use Each

### Use ChromaDB when:
- ✅ Simple setup needed
- ✅ Local development
- ✅ Small to medium datasets
- ✅ Cost is a concern
- ✅ Quick prototyping

### Use pgvector + Supabase when:
- ✅ Production deployment
- ✅ Large datasets
- ✅ Need ACID compliance
- ✅ Want SQL integration
- ✅ Need enterprise features
- ✅ Want managed service

## 🚀 Next Steps

1. **Set up Supabase project**
2. **Enable pgvector extension**
3. **Create documents table**
4. **Update environment variables**
5. **Test the pipeline**
6. **Monitor performance**
7. **Scale as needed**

The pgvector + Supabase combination provides enterprise-grade vector storage with excellent performance, security, and scalability for production RAG applications.
