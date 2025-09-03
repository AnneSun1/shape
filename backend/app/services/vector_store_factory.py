from app.services.pgvector_store_service import pgvector_store_service

class VectorStoreFactory:
    """Factory for creating vector store services"""
    
    @staticmethod
    def get_vector_store():
        """Get the pgvector store service"""
        return pgvector_store_service
    
    @staticmethod
    def get_vector_store_type() -> str:
        """Get the current vector store type"""
        return "pgvector"

# Global factory instance
vector_store_factory = VectorStoreFactory()
