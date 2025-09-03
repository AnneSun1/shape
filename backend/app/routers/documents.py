import os
import tempfile
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.services.rag_service import rag_service
from app.schemas.document import DocumentUploadResponse, DocumentStatsResponse, DocumentDeleteResponse

router = APIRouter(prefix="/documents", tags=["documents"])

@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    file: Optional[UploadFile] = File(None),
    text_content: Optional[str] = Form(None),
    title: str = Form("Document"),
    user_id: str = Form(...),  # In a real app, get this from auth
    db: Session = Depends(get_db)
):
    """Upload and ingest a document into the RAG system"""
    try:
        if not file and not text_content:
            raise HTTPException(status_code=400, detail="Either file or text_content must be provided")
        
        if file:
            # Handle file upload
            if not file.filename.lower().endswith('.pdf'):
                raise HTTPException(status_code=400, detail="Only PDF files are supported")
            
            # Save file temporarily
            with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
                content = await file.read()
                temp_file.write(content)
                temp_file_path = temp_file.name
            
            try:
                # Process the document
                result = await rag_service.ingest_document(
                    db=db,
                    user_id=user_id,
                    file_path=temp_file_path,
                    title=title
                )
            finally:
                # Clean up temporary file
                os.unlink(temp_file_path)
        else:
            # Handle text content
            result = await rag_service.ingest_document(
                db=db,
                user_id=user_id,
                text_content=text_content,
                title=title
            )
        
        if not result["success"]:
            raise HTTPException(status_code=500, detail=result["error"])
        
        return DocumentUploadResponse(
            success=True,
            document_id=result["document_id"],
            total_chunks=result["total_chunks"],
            stats=result["stats"],
            title=result["title"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading document: {str(e)}")

@router.get("/stats/{user_id}", response_model=DocumentStatsResponse)
async def get_document_stats(
    user_id: str,
    db: Session = Depends(get_db)
):
    """Get statistics about user's documents"""
    try:
        stats = rag_service.get_user_document_stats(user_id, db)
        
        if "error" in stats:
            raise HTTPException(status_code=500, detail=stats["error"])
        
        return DocumentStatsResponse(
            success=True,
            total_documents=stats["total_documents"],
            total_chunks=stats["total_chunks"],
            sources=stats["sources"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting document stats: {str(e)}")

@router.delete("/{user_id}", response_model=DocumentDeleteResponse)
async def delete_user_documents(
    user_id: str,
    db: Session = Depends(get_db)
):
    """Delete all documents for a user"""
    try:
        result = rag_service.delete_user_documents(user_id, db)
        
        if not result["success"]:
            raise HTTPException(status_code=500, detail=result["error"])
        
        return DocumentDeleteResponse(
            success=True,
            message=result["message"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting documents: {str(e)}")
