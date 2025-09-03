import os
import json
from typing import List, Dict, Any, Optional
from uuid import uuid4
import numpy as np
from sqlalchemy import text
from sqlalchemy.orm import Session
from decouple import config
from app.services.embedding_service import embedding_service

class PGVectorStoreService:
    """Service for managing vector storage and retrieval using pgvector"""
    
    def __init__(self):
        self.embedding_dimension = embedding_service.get_dimension()
    
    def add_documents(self, db: Session, documents: List[Dict[str, Any]], user_id: str) -> List[str]:
        """Add documents to the vector store using pgvector"""
        try:
            document_ids = []
            
            for doc in documents:
                # Generate embedding
                embedding = embedding_service.generate_single_embedding(doc["content"])
                
                # Insert into database
                result = db.execute(
                    text("""
                        INSERT INTO documents (
                            id, user_id, content, embedding, metadata, created_at
                        ) VALUES (
                            :id, :user_id, :content, :embedding, :metadata, :created_at
                        ) RETURNING id
                    """),
                    {
                        "id": str(uuid4()),
                        "user_id": user_id,
                        "content": doc["content"],
                        "embedding": embedding,
                        "metadata": json.dumps({
                            "source": doc.get("source", "unknown"),
                            "chunk_index": doc.get("chunk_index", 0),
                            "title": doc.get("title", ""),
                            "document_id": doc.get("document_id", ""),
                            "token_count": doc.get("token_count", 0)
                        }),
                        "created_at": doc.get("created_at", "")
                    }
                )
                
                document_id = result.fetchone()[0]
                document_ids.append(document_id)
            
            db.commit()
            return document_ids
            
        except Exception as e:
            db.rollback()
            raise Exception(f"Error adding documents to pgvector: {str(e)}")
    
    def search_documents(
        self, 
        db: Session,
        query: str, 
        user_id: str, 
        n_results: int = 5,
        similarity_threshold: float = 0.5
    ) -> List[Dict[str, Any]]:
        """Search for relevant documents using pgvector"""
        try:
            # Generate query embedding
            query_embedding = embedding_service.generate_single_embedding(query)
            
            # Search using cosine similarity
            result = db.execute(
                text("""
                    SELECT 
                        id, content, metadata,
                        1 - (embedding <=> :query_embedding) as similarity
                    FROM documents 
                    WHERE user_id = :user_id
                    AND 1 - (embedding <=> :query_embedding) > :threshold
                    ORDER BY embedding <=> :query_embedding
                    LIMIT :limit
                """),
                {
                    "query_embedding": query_embedding,
                    "user_id": user_id,
                    "threshold": similarity_threshold,
                    "limit": n_results
                }
            )
            
            # Format results
            formatted_results = []
            for row in result.fetchall():
                formatted_results.append({
                    "id": row.id,
                    "content": row.content,
                    "metadata": json.loads(row.metadata),
                    "similarity": float(row.similarity)
                })
            
            return formatted_results
            
        except Exception as e:
            raise Exception(f"Error searching documents: {str(e)}")
    
    def delete_user_documents(self, db: Session, user_id: str) -> bool:
        """Delete all documents for a specific user"""
        try:
            db.execute(
                text("DELETE FROM documents WHERE user_id = :user_id"),
                {"user_id": user_id}
            )
            db.commit()
            return True
            
        except Exception as e:
            db.rollback()
            raise Exception(f"Error deleting user documents: {str(e)}")
    
    def get_document_stats(self, db: Session, user_id: str) -> Dict[str, Any]:
        """Get statistics about user's documents"""
        try:
            # Get total count
            count_result = db.execute(
                text("SELECT COUNT(*) FROM documents WHERE user_id = :user_id"),
                {"user_id": user_id}
            )
            total_chunks = count_result.fetchone()[0]
            
            # Get unique sources
            sources_result = db.execute(
                text("""
                    SELECT DISTINCT metadata->>'source' as source
                    FROM documents 
                    WHERE user_id = :user_id
                """),
                {"user_id": user_id}
            )
            sources = [row.source for row in sources_result.fetchall() if row.source]
            
            return {
                "total_documents": len(set([row.source for row in sources_result.fetchall() if row.source])),
                "total_chunks": total_chunks,
                "sources": sources
            }
            
        except Exception as e:
            raise Exception(f"Error getting document stats: {str(e)}")
    
    def create_indexes(self, db: Session) -> bool:
        """Create necessary indexes for optimal performance"""
        try:
            # Create HNSW index for fast similarity search
            db.execute(text("""
                CREATE INDEX IF NOT EXISTS documents_embedding_idx 
                ON documents 
                USING hnsw (embedding vector_cosine_ops)
                WITH (m = 16, ef_construction = 64)
            """))
            
            # Create index on user_id for filtering
            db.execute(text("""
                CREATE INDEX IF NOT EXISTS documents_user_id_idx 
                ON documents (user_id)
            """))
            
            db.commit()
            return True
            
        except Exception as e:
            db.rollback()
            raise Exception(f"Error creating indexes: {str(e)}")

# Global pgvector store service instance
pgvector_store_service = PGVectorStoreService()
