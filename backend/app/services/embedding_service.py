import os
from typing import List, Dict, Any
from sentence_transformers import SentenceTransformer
import numpy as np
from decouple import config

class EmbeddingService:
    """Service for generating text embeddings"""
    
    def __init__(self):
        # Use a lightweight but effective embedding model
        self.model_name = config("EMBEDDING_MODEL", default="all-MiniLM-L6-v2")
        self.model = SentenceTransformer(self.model_name)
        self.dimension = self.model.get_sentence_embedding_dimension()
    
    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for a list of texts"""
        try:
            embeddings = self.model.encode(texts, convert_to_tensor=False)
            return embeddings.tolist()
        except Exception as e:
            raise Exception(f"Error generating embeddings: {str(e)}")
    
    def generate_single_embedding(self, text: str) -> List[float]:
        """Generate embedding for a single text"""
        try:
            embedding = self.model.encode([text], convert_to_tensor=False)
            return embedding[0].tolist()
        except Exception as e:
            raise Exception(f"Error generating embedding: {str(e)}")
    
    def similarity(self, embedding1: List[float], embedding2: List[float]) -> float:
        """Calculate cosine similarity between two embeddings"""
        try:
            vec1 = np.array(embedding1)
            vec2 = np.array(embedding2)
            return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))
        except Exception as e:
            raise Exception(f"Error calculating similarity: {str(e)}")
    
    def get_dimension(self) -> int:
        """Get the dimension of the embeddings"""
        return self.dimension

# Global embedding service instance
embedding_service = EmbeddingService()
