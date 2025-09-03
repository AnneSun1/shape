import os
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.services.document_processor import document_processor
from app.services.vector_store_factory import vector_store_factory
from app.services.llm_service import llm_service
from app.services.message_service import create_message

class RAGService:
    """Main RAG service that orchestrates the entire pipeline"""
    
    def __init__(self):
        self.max_context_length = 4000  # Maximum context length for LLM
        self.max_retrieved_chunks = 5    # Maximum number of chunks to retrieve
    
    async def ingest_document(
        self, 
        db: Session, 
        user_id: str, 
        file_path: Optional[str] = None, 
        text_content: Optional[str] = None,
        title: str = "Document"
    ) -> Dict[str, Any]:
        """Ingest a document into the RAG system"""
        try:
            # Process document based on type
            if file_path and file_path.lower().endswith('.pdf'):
                chunks = document_processor.process_pdf(file_path, user_id)
            elif text_content:
                chunks = document_processor.process_text(text_content, user_id, title)
            else:
                raise ValueError("Either file_path or text_content must be provided")
            
            # Add chunks to vector store
            vector_store = vector_store_factory.get_vector_store()
            chunk_ids = vector_store.add_documents(db, chunks, user_id)
            
            # Get processing statistics
            stats = document_processor.get_chunk_stats(chunks)
            
            return {
                "success": True,
                "document_id": chunks[0]["document_id"] if chunks else None,
                "total_chunks": len(chunks),
                "chunk_ids": chunk_ids,
                "stats": stats,
                "title": title
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def generate_rag_response(
        self, 
        db: Session, 
        chat_id: str, 
        user_id: str, 
        user_message: str,
        llm_provider: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate a RAG-enhanced response"""
        try:
            # Retrieve relevant documents
            vector_store = vector_store_factory.get_vector_store()
            retrieved_docs = vector_store.search_documents(
                db, query=user_message,
                user_id=user_id,
                n_results=self.max_retrieved_chunks,
                similarity_threshold=0.5
            )
            
            # Create user message
            user_message_id = create_message(db, chat_id, user_id, "user", user_message)
            
            # Prepare context from retrieved documents
            context = self._prepare_context(retrieved_docs)
            
            # Generate enhanced system prompt
            system_prompt = self._create_rag_system_prompt(context)
            
            # Get chat history
            from app.services.message_service import get_chat_history
            chat_history = get_chat_history(db, chat_id)
            
            # Generate AI response with RAG context
            ai_response = await llm_service.generate_chat_response(
                user_message=user_message,
                chat_history=chat_history,
                system_prompt=system_prompt,
                provider=llm_provider,
                max_tokens=1000,
                temperature=0.7
            )
            
            # Create AI response message
            ai_message_id = create_message(db, chat_id, user_id, "assistant", ai_response)
            
            return {
                "user_message_id": user_message_id,
                "ai_message_id": ai_message_id,
                "ai_response": ai_response,
                "retrieved_docs": len(retrieved_docs),
                "context_used": bool(context),
                "success": True
            }
            
        except Exception as e:
            # Create error message
            error_message = f"Sorry, I'm having trouble generating a response right now. Please try again later. Error: {str(e)}"
            ai_message_id = create_message(db, chat_id, user_id, "assistant", error_message)
            
            return {
                "user_message_id": user_message_id,
                "ai_message_id": ai_message_id,
                "ai_response": error_message,
                "error": str(e),
                "success": False
            }
    
    def _prepare_context(self, retrieved_docs: List[Dict[str, Any]]) -> str:
        """Prepare context from retrieved documents"""
        if not retrieved_docs:
            return ""
        
        context_parts = []
        total_length = 0
        
        for doc in retrieved_docs:
            content = doc["content"]
            source = doc["metadata"].get("title", "Unknown")
            
            # Check if adding this would exceed context limit
            if total_length + len(content) > self.max_context_length:
                break
            
            context_parts.append(f"Source: {source}\nContent: {content}\n")
            total_length += len(content)
        
        return "\n".join(context_parts)
    
    def _create_rag_system_prompt(self, context: str) -> str:
        """Create a system prompt that includes RAG context"""
        base_prompt = """You are a helpful AI assistant for a study guide application. You have access to relevant documents to help answer questions accurately.

When answering questions:
1. Use the provided context when it's relevant to the question
2. Cite the source when using information from the context
3. If the context doesn't contain relevant information, rely on your general knowledge
4. Be clear, educational, and helpful
5. If you're unsure about something, say so rather than making up information

Context from relevant documents:
{context}

Please provide clear, educational responses based on the context above and your general knowledge."""
        
        return base_prompt.format(context=context if context else "No relevant documents found.")
    
    def get_user_document_stats(self, user_id: str, db: Session) -> Dict[str, Any]:
        """Get statistics about user's documents"""
        try:
            vector_store = vector_store_factory.get_vector_store()
            return vector_store.get_document_stats(db, user_id)
        except Exception as e:
            return {
                "error": str(e),
                "total_documents": 0,
                "total_chunks": 0,
                "sources": []
            }
    
    def delete_user_documents(self, user_id: str, db: Session) -> Dict[str, Any]:
        """Delete all documents for a user"""
        try:
            vector_store = vector_store_factory.get_vector_store()
            success = vector_store.delete_user_documents(db, user_id)
            return {
                "success": success,
                "message": "All documents deleted successfully" if success else "Failed to delete documents"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

# Global RAG service instance
rag_service = RAGService()
