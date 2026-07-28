"""Upload and documents API routes."""

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from backend.models.document import DocumentItem, UploadResponse
from backend.uploads.service import DocumentUploadService, get_document_upload_service

router = APIRouter(tags=["documents"])


@router.post("/upload", response_model=UploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    upload_service: DocumentUploadService = Depends(get_document_upload_service),
) -> UploadResponse:
    """Upload a PDF and ingest it into the vector database."""

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    file_bytes = await file.read()

    try:
        return upload_service.save_and_ingest(file.filename, file_bytes)
    finally:
        await file.close()


@router.get("/documents", response_model=list[DocumentItem])
def list_documents(
    upload_service: DocumentUploadService = Depends(get_document_upload_service),
) -> list[DocumentItem]:
    """List all known corpus PDFs and uploaded documents."""

    return upload_service.list_documents()
