# RAG Pipeline Setup Guide (pgvector + Supabase)

This guide will help you set up and use the Retrieval-Augmented Generation (RAG) pipeline using pgvector and Supabase for your study guide application.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Set Up Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# LLM Providers (at least one required)
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
OLLAMA_BASE_URL=http://localhost:11434

# Vector Database
VECTOR_STORE_TYPE=pgvector

# Document Processing
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
EMBEDDING_MODEL=all-MiniLM-L6-v2

# Database
DATABASE_URL=sqlite:///./test.db
```

### 3. Start Ollama (Optional but Recommended)

If you want to use local LLMs:

```bash
# Install Ollama from https://ollama.ai
ollama pull llama2:latest
ollama serve
```

### 4. Test the Pipeline

```bash
python test_rag.py
```

## 📚 How the RAG Pipeline Works

### Components

1. **Document Processor** (`document_processor.py`)
   - Handles document ingestion (PDF, text)
   - Chunks documents into smaller pieces
   - Cleans and normalizes text

2. **Embedding Service** (`embedding_service.py`)
   - Generates vector embeddings for text
   - Uses SentenceTransformers for high-quality embeddings
   - Calculates similarity between texts

3. **Vector Store** (`pgvector_store_service.py`)
   - Stores document chunks as vectors in PostgreSQL
   - Performs semantic search using pgvector
   - Manages document metadata with JSONB

4. **RAG Service** (`rag_service.py`)
   - Orchestrates the entire pipeline
   - Retrieves relevant documents
   - Generates enhanced AI responses

### Flow

1. **Document Ingestion**: Upload PDF or text → Process into chunks → Generate embeddings → Store in vector database
2. **Query Processing**: User asks question → Generate query embedding → Search for relevant documents → Retrieve context
3. **Response Generation**: Combine context with user question → Send to LLM → Generate enhanced response

## 🔧 API Endpoints

### Document Management

#### Upload Document
```http
POST /documents/upload
Content-Type: multipart/form-data

file: [PDF file] (optional)
text_content: "Your text content" (optional)
title: "Document Title"
user_id: "user123"
```

#### Get Document Stats
```http
GET /documents/stats/{user_id}
```

#### Delete User Documents
```http
DELETE /documents/{user_id}
```

### Enhanced Chat with RAG

#### Send Message with RAG
```http
POST /messages
Content-Type: application/json

{
  "chatId": "chat123",
  "role": "user",
  "content": "What is machine learning?",
  "llmProvider": "ollama",
  "useRag": true
}
```

## 🛠️ Configuration Options

### Chunking Strategy
- `CHUNK_SIZE`: Maximum tokens per chunk (default: 1000)
- `CHUNK_OVERLAP`: Overlap between chunks (default: 200)

### Embedding Model
- `EMBEDDING_MODEL`: SentenceTransformers model (default: all-MiniLM-L6-v2)
- Options: all-MiniLM-L6-v2, all-mpnet-base-v2, paraphrase-multilingual-MiniLM-L12-v2

### Vector Database
- `VECTOR_STORE_TYPE`: Vector store type (default: pgvector)
- Requires PostgreSQL with pgvector extension

### LLM Providers
- OpenAI GPT models
- Anthropic Claude models
- Ollama local models
- Hugging Face models

## 📊 Performance Tips

### Optimizing Chunk Size
- **Small chunks (500-800 tokens)**: Better for specific questions, more precise retrieval
- **Large chunks (1000-1500 tokens)**: Better for complex questions, more context

### Embedding Model Selection
- **all-MiniLM-L6-v2**: Fast, good quality, 384 dimensions
- **all-mpnet-base-v2**: Higher quality, slower, 768 dimensions
- **paraphrase-multilingual-MiniLM-L12-v2**: Multilingual support

### Retrieval Strategy
- **Number of results**: 3-5 chunks usually work well
- **Similarity threshold**: 0.5-0.7 for good balance of relevance and recall

## 🔍 Troubleshooting

### Common Issues

1. **pgvector Extension Not Found**
   ```sql
   -- Check if pgvector extension is installed
   SELECT * FROM pg_extension WHERE extname = 'vector';
   ```

2. **Embedding Model Download**
   ```bash
   # The model will download automatically on first use
   # Check internet connection if it fails
   ```

3. **Ollama Not Responding**
   ```bash
   # Check if Ollama is running
   curl http://localhost:11434/api/tags
   
   # Restart Ollama if needed
   ollama serve
   ```

4. **Memory Issues**
   - Reduce chunk size
   - Use smaller embedding model
   - Limit number of retrieved documents

### Debug Mode

Enable debug logging by setting environment variables:
```env
LOG_LEVEL=DEBUG
```

## 🚀 Next Steps

### Advanced Features to Add

1. **Hybrid Search**: Combine semantic and keyword search
2. **Reranking**: Use a second model to rerank retrieved documents
3. **Document Metadata**: Add tags, categories, and custom metadata
4. **Incremental Updates**: Update documents without reprocessing everything
5. **Multi-modal Support**: Handle images, tables, and other content types
6. **Caching**: Cache embeddings and search results for better performance

### Production Considerations

1. **Scalability**: Use distributed vector databases like Pinecone or Weaviate
2. **Security**: Implement proper authentication and authorization
3. **Monitoring**: Add metrics and logging for performance monitoring
4. **Backup**: Regular backups of vector database and metadata
5. **Rate Limiting**: Implement API rate limiting for production use

## 📖 Example Usage

### Python Client Example

```python
import requests

# Upload a document
with open("study_guide.pdf", "rb") as f:
    response = requests.post(
        "http://localhost:8000/documents/upload",
        files={"file": f},
        data={"user_id": "user123", "title": "Study Guide"}
    )

# Ask a question with RAG
response = requests.post(
    "http://localhost:8000/messages",
    json={
        "role": "user",
        "content": "What are the main concepts in machine learning?",
        "useRag": True,
        "llmProvider": "ollama"
    }
)

print(response.json()["aiResponse"])
```

### cURL Examples

```bash
# Upload text content
curl -X POST "http://localhost:8000/documents/upload" \
  -F "text_content=Machine learning is a subset of AI..." \
  -F "title=ML Basics" \
  -F "user_id=user123"

# Get document stats
curl "http://localhost:8000/documents/stats/user123"

# Send RAG-enhanced message
curl -X POST "http://localhost:8000/messages" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "user",
    "content": "Explain supervised learning",
    "useRag": true,
    "llmProvider": "ollama"
  }'
```

## 🤝 Contributing

When adding new features to the RAG pipeline:

1. Follow the existing service pattern
2. Add proper error handling
3. Include tests for new functionality
4. Update this documentation
5. Consider performance implications

## 📄 License

This RAG pipeline is part of the study guide application and follows the same license terms.
