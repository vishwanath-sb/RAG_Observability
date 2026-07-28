import { useEffect, useState } from 'react'

import { fetchDocuments, uploadDocument } from '../lib/api'
import type { DocumentItem } from '../types'

export function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [status, setStatus] = useState<string>('')
  const [documents, setDocuments] = useState<DocumentItem[]>([])

  useEffect(() => {
    void refreshDocuments()
  }, [])

  async function refreshDocuments() {
    setDocuments(await fetchDocuments())
  }

  async function handleUpload() {
    if (!selectedFile) {
      return
    }

    setStatus('Uploading and ingesting...')
    try {
      const response = await uploadDocument(selectedFile)
      setStatus(`Ingested ${response.chunk_count} chunks from ${response.filename}`)
      setSelectedFile(null)
      await refreshDocuments()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Upload failed.')
    }
  }

  return (
    <div className="max-w-6xl mx-auto w-full grid gap-6 md:grid-cols-2">
      {/* Upload Box */}
      <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-white mb-2">Ingest Policy Document</h3>
          <p className="text-sm text-ink-200/60 mb-6">
            Upload custom PDFs to parse and store them into ChromaDB. They will instantly become available for semantic retrieval in the assistant.
          </p>

          <div className="border-2 border-dashed border-white/10 hover:border-mint-500/50 rounded-2xl p-8 text-center bg-ink-950/20 transition flex flex-col items-center justify-center">
            <svg className="w-10 h-10 text-ink-300/40 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <label className="cursor-pointer bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-semibold px-4 py-2 rounded-xl transition inline-block">
              Choose PDF File
              <input
                type="file"
                accept="application/pdf"
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                className="hidden"
              />
            </label>
            <p className="text-xs text-ink-200/40 mt-3">Supports PDF documents up to 10MB</p>
          </div>

          {selectedFile && (
            <div className="mt-4 flex items-center justify-between rounded-xl bg-mint-500/5 border border-mint-500/25 px-4 py-3 text-xs text-mint-300">
              <div className="flex items-center gap-2 truncate">
                <svg className="w-4 h-4 text-mint-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-semibold truncate">{selectedFile.name}</span>
              </div>
              <span className="shrink-0 font-mono text-[10px]">{(selectedFile.size / 1024).toFixed(1)} KB</span>
            </div>
          )}

          {status && (
            <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-sand-300">
              {status}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => void handleUpload()}
          disabled={!selectedFile}
          className="mt-6 w-full rounded-xl bg-mint-500 hover:bg-mint-400 text-ink-950 font-bold py-3 text-sm transition disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-mint-500/10"
        >
          Upload & Index Document
        </button>
      </div>

      {/* Corpus Box */}
      <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Knowledge Ingested</h3>
            <p className="text-sm text-ink-200/60 mt-1">Browse documents inside the vector space.</p>
          </div>
          <span className="text-xs bg-white/5 border border-white/10 rounded-full px-3 py-1 font-semibold text-white">
            {documents.length} Files
          </span>
        </div>

        <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1">
          {documents.map((document) => (
            <div
              key={document.path}
              className="rounded-xl border border-white/5 bg-ink-950/20 hover:bg-ink-950/40 p-4 transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-ink-200/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white truncate" title={document.filename}>
                      {document.filename}
                    </div>
                    <div className="text-[10px] text-ink-200/40 truncate mt-0.5 font-mono">{document.path}</div>
                  </div>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  document.is_uploaded
                    ? 'bg-mint-500/10 text-mint-300 border border-mint-500/20'
                    : 'bg-white/5 text-ink-200/70 border border-white/10'
                }`}>
                  {document.is_uploaded ? 'User' : 'Base'}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-4 text-[10px] text-ink-300/40 font-mono">
                <span>{(document.size_bytes / 1024).toFixed(1)} KB</span>
                <span>•</span>
                <span>{new Date(document.uploaded_at).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
