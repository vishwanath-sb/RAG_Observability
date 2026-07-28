"""Service for storing and ingesting uploaded PDF documents."""

from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import BinaryIO

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

from backend.models.document import DocumentItem, UploadResponse
from rag.embeddings import get_embedding_model
from rag.vector_store import get_vector_store


UPLOAD_DIRECTORY = Path("backend") / "uploads"
CORPUS_DIRECTORY = Path("data") / "pdfs"


@dataclass(slots=True)
class StoredUpload:
    """Result of saving an uploaded file to disk."""

    filename: str
    path: Path


class DocumentUploadService:
    """Handles upload persistence, ingestion, and document listing."""

    def __init__(self) -> None:
        self._embeddings = get_embedding_model()
        self._vector_store = get_vector_store(self._embeddings)
        UPLOAD_DIRECTORY.mkdir(parents=True, exist_ok=True)

    def save_and_ingest(self, filename: str, file_bytes: bytes) -> UploadResponse:
        """Store a PDF and ingest its chunks into Chroma."""

        stored_upload = self._save_file(filename, file_bytes)
        chunk_count = self._ingest_pdf(stored_upload.path)

        return UploadResponse(
            filename=stored_upload.filename,
            path=str(stored_upload.path),
            chunk_count=chunk_count,
        )

    def list_documents(self) -> list[DocumentItem]:
        """Return the known corpus and uploaded documents."""

        documents: list[DocumentItem] = []

        for directory, is_uploaded in (
            (CORPUS_DIRECTORY, False),
            (UPLOAD_DIRECTORY, True),
        ):
            if not directory.exists():
                continue

            for path in sorted(directory.glob("*.pdf")):
                stat_result = path.stat()
                documents.append(
                    DocumentItem(
                        filename=path.name,
                        path=str(path),
                        size_bytes=stat_result.st_size,
                        uploaded_at=self._to_datetime(stat_result.st_mtime),
                        is_uploaded=is_uploaded,
                    )
                )

        return documents

    def _save_file(self, filename: str, file_bytes: bytes) -> StoredUpload:
        """Persist the uploaded file into the upload directory."""

        safe_name = Path(filename).name
        target_path = UPLOAD_DIRECTORY / safe_name
        target_path.write_bytes(file_bytes)
        return StoredUpload(filename=safe_name, path=target_path)

    def _ingest_pdf(self, pdf_path: Path) -> int:
        """Load, split, and add a PDF's chunks to the vector store."""

        loader = PyPDFLoader(str(pdf_path))
        documents = loader.load()

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
        )
        chunks = splitter.split_documents(documents)

        if chunks:
            self._vector_store.add_documents(chunks)

        return len(chunks)

    @staticmethod
    def _to_datetime(timestamp: float):
        """Convert a filesystem timestamp into a datetime object."""

        from datetime import datetime

        return datetime.fromtimestamp(timestamp)


@lru_cache(maxsize=1)
def get_document_upload_service() -> DocumentUploadService:
    """Return a singleton upload service instance."""

    return DocumentUploadService()
