import os
import re
from typing import List, Dict, Any, Optional
from datetime import datetime
from uuid import uuid4
import tiktoken
from pypdf import PdfReader
from decouple import config

class DocumentProcessor:
    """Service for processing and chunking documents"""
    
    def __init__(self):
        self.chunk_size = int(config("CHUNK_SIZE", default="1000"))
        self.chunk_overlap = int(config("CHUNK_OVERLAP", default="200"))
        self.encoding = tiktoken.get_encoding("cl100k_base")  # OpenAI's encoding
    
    def count_tokens(self, text: str) -> int:
        """Count tokens in text using tiktoken"""
        return len(self.encoding.encode(text))
    
    def chunk_text(self, text: str, chunk_size: Optional[int] = None, chunk_overlap: Optional[int] = None) -> List[str]:
        """Split text into chunks with overlap"""
        if chunk_size is None:
            chunk_size = self.chunk_size
        if chunk_overlap is None:
            chunk_overlap = self.chunk_overlap
        
        # Split by sentences first
        sentences = re.split(r'[.!?]+', text)
        chunks = []
        current_chunk = ""
        
        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue
            
            # Check if adding this sentence would exceed chunk size
            test_chunk = current_chunk + " " + sentence if current_chunk else sentence
            if self.count_tokens(test_chunk) <= chunk_size:
                current_chunk = test_chunk
            else:
                # Current chunk is full, save it
                if current_chunk:
                    chunks.append(current_chunk.strip())
                
                # Start new chunk with overlap
                if chunk_overlap > 0 and chunks:
                    # Get last few sentences from previous chunk for overlap
                    last_chunk_sentences = re.split(r'[.!?]+', chunks[-1])
                    overlap_text = " ".join(last_chunk_sentences[-2:])  # Last 2 sentences
                    current_chunk = overlap_text + " " + sentence
                else:
                    current_chunk = sentence
        
        # Add the last chunk
        if current_chunk:
            chunks.append(current_chunk.strip())
        
        return chunks
    
    def process_pdf(self, file_path: str, user_id: str) -> List[Dict[str, Any]]:
        """Process a PDF file and return chunks"""
        try:
            reader = PdfReader(file_path)
            text = ""
            
            # Extract text from all pages
            for page in reader:
                text += page.extract_text() + "\n"
            
            # Clean up text
            text = self.clean_text(text)
            
            # Chunk the text
            chunks = self.chunk_text(text)
            
            # Create document chunks
            document_chunks = []
            document_id = str(uuid4())
            
            for i, chunk in enumerate(chunks):
                document_chunks.append({
                    "content": chunk,
                    "user_id": user_id,
                    "source": "pdf",
                    "title": os.path.basename(file_path),
                    "chunk_index": i,
                    "document_id": document_id,
                    "created_at": datetime.now().isoformat(),
                    "token_count": self.count_tokens(chunk)
                })
            
            return document_chunks
            
        except Exception as e:
            raise Exception(f"Error processing PDF: {str(e)}")
    
    def process_text(self, text: str, user_id: str, title: str = "Text Document") -> List[Dict[str, Any]]:
        """Process plain text and return chunks"""
        try:
            # Clean up text
            text = self.clean_text(text)
            
            # Chunk the text
            chunks = self.chunk_text(text)
            
            # Create document chunks
            document_chunks = []
            document_id = str(uuid4())
            
            for i, chunk in enumerate(chunks):
                document_chunks.append({
                    "content": chunk,
                    "user_id": user_id,
                    "source": "text",
                    "title": title,
                    "chunk_index": i,
                    "document_id": document_id,
                    "created_at": datetime.now().isoformat(),
                    "token_count": self.count_tokens(chunk)
                })
            
            return document_chunks
            
        except Exception as e:
            raise Exception(f"Error processing text: {str(e)}")
    
    def clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove special characters but keep basic punctuation
        text = re.sub(r'[^\w\s\.\,\!\?\;\:\-\(\)\[\]]', '', text)
        
        # Normalize line breaks
        text = text.replace('\n', ' ').replace('\r', ' ')
        
        return text.strip()
    
    def get_chunk_stats(self, chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Get statistics about document chunks"""
        total_tokens = sum(chunk.get("token_count", 0) for chunk in chunks)
        avg_tokens_per_chunk = total_tokens / len(chunks) if chunks else 0
        
        return {
            "total_chunks": len(chunks),
            "total_tokens": total_tokens,
            "avg_tokens_per_chunk": round(avg_tokens_per_chunk, 2),
            "min_tokens": min(chunk.get("token_count", 0) for chunk in chunks) if chunks else 0,
            "max_tokens": max(chunk.get("token_count", 0) for chunk in chunks) if chunks else 0
        }

# Global document processor instance
document_processor = DocumentProcessor()
