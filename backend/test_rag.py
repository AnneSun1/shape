#!/usr/bin/env python3
"""
Test script for the RAG pipeline
"""

import asyncio
import os
import sys
from pathlib import Path

# Add the app directory to the Python path
sys.path.append(str(Path(__file__).parent / "app"))

from app.services.rag_service import rag_service
from app.services.document_processor import document_processor
from app.services.pgvector_store_service import pgvector_store_service
from app.db.base import SessionLocal

async def test_rag_pipeline():
    """Test the complete RAG pipeline"""
    print("🧪 Testing RAG Pipeline...")
    
    # Test user ID
    test_user_id = "test-user-123"
    
    # Test document content
    test_content = """
    Machine Learning Fundamentals
    
    Machine learning is a subset of artificial intelligence that enables computers to learn and make decisions without being explicitly programmed. There are three main types of machine learning:
    
    1. Supervised Learning: The algorithm learns from labeled training data to make predictions on new, unseen data.
    2. Unsupervised Learning: The algorithm finds patterns in data without any labels or guidance.
    3. Reinforcement Learning: The algorithm learns by interacting with an environment and receiving rewards or penalties.
    
    Key concepts in machine learning include:
    - Features: The input variables used to make predictions
    - Labels: The output variables we want to predict
    - Training: The process of teaching the model using data
    - Testing: Evaluating the model's performance on new data
    - Overfitting: When a model performs well on training data but poorly on new data
    - Underfitting: When a model is too simple to capture the patterns in the data
    
    Popular machine learning algorithms include:
    - Linear Regression: For predicting continuous values
    - Logistic Regression: For binary classification problems
    - Decision Trees: For both classification and regression
    - Random Forests: An ensemble method using multiple decision trees
    - Support Vector Machines: For classification with clear margins
    - Neural Networks: Deep learning models inspired by biological neurons
    """
    
    try:
        # Test 1: Document Processing
        print("\n📄 Test 1: Document Processing")
        chunks = document_processor.process_text(test_content, test_user_id, "Machine Learning Guide")
        print(f"✅ Created {len(chunks)} chunks")
        print(f"📊 Chunk stats: {document_processor.get_chunk_stats(chunks)}")
        
        # Test 2: Vector Store
        print("\n🗄️ Test 2: Vector Store")
        db = SessionLocal()
        try:
            chunk_ids = pgvector_store_service.add_documents(db, chunks, test_user_id)
            print(f"✅ Added {len(chunk_ids)} chunks to vector store")
        finally:
            db.close()
        
        # Test 3: Document Retrieval
        print("\n🔍 Test 3: Document Retrieval")
        db = SessionLocal()
        try:
            query = "What are the main types of machine learning?"
            retrieved_docs = pgvector_store_service.search_documents(
                db, query=query,
                user_id=test_user_id,
                n_results=3
            )
            print(f"✅ Retrieved {len(retrieved_docs)} relevant documents")
            for i, doc in enumerate(retrieved_docs):
                print(f"   Document {i+1}: {doc['content'][:100]}...")
        finally:
            db.close()
        
        # Test 4: RAG Response Generation
        print("\n🤖 Test 4: RAG Response Generation")
        db = SessionLocal()
        try:
            result = await rag_service.generate_rag_response(
                db=db,
                chat_id="test-chat-123",
                user_id=test_user_id,
                user_message="Explain the difference between supervised and unsupervised learning",
                llm_provider="ollama"
            )
            
            if result["success"]:
                print(f"✅ Generated RAG response with {result['retrieved_docs']} retrieved documents")
                print(f"📝 Response: {result['ai_response'][:200]}...")
            else:
                print(f"❌ Failed to generate response: {result.get('error', 'Unknown error')}")
                
        finally:
            db.close()
        
        # Test 5: Document Stats
        print("\n📈 Test 5: Document Stats")
        db = SessionLocal()
        try:
            stats = rag_service.get_user_document_stats(test_user_id, db)
            print(f"✅ User has {stats['total_chunks']} chunks from {len(stats['sources'])} sources")
        finally:
            db.close()
        
        print("\n🎉 All tests completed successfully!")
        
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_rag_pipeline())
