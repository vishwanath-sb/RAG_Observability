import { useEffect, useState } from 'react'

import { fetchDocuments } from '../lib/api'
import type { DocumentItem } from '../types'

export function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([])

  useEffect(() => {
    void fetchDocuments().then(setDocuments)
  }, [])

  return (
    <div className="max-w-6xl mx-auto w-full">
      <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur">
        <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">Active Policy Corpus</h3>
            <p className="text-sm text-ink-200/60 mt-1">
              Documents currently loaded into the semantic index for RAG.
            </p>
          </div>
          <span className="text-xs bg-white/5 border border-white/10 rounded-full px-3 py-1 font-semibold text-white">
            {documents.length} Total Documents
          </span>
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-12 text-sm text-ink-200/40">
            No documents found in the corpus. Use the Upload tab to add some.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((document) => (
              <article
                key={document.path}
                className="group rounded-2xl border border-white/5 bg-ink-950/20 hover:bg-ink-950/40 p-5 transition duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-mint-500/30 transition shrink-0">
                      <svg className="w-5 h-5 text-ink-200/70 group-hover:text-mint-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      document.is_uploaded
                        ? 'bg-mint-500/10 text-mint-300 border border-mint-500/20'
                        : 'bg-white/5 text-ink-200/70 border border-white/10'
                    }`}>
                      {document.is_uploaded ? 'User' : 'Base'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white truncate group-hover:text-mint-300 transition" title={document.filename}>
                    {document.filename}
                  </h4>
                  <p className="mt-1.5 text-[10px] text-ink-200/40 font-mono truncate" title={document.path}>
                    {document.path}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-ink-300/40 font-mono">
                  <span>Size: {(document.size_bytes / 1024).toFixed(1)} KB</span>
                  <span>{new Date(document.uploaded_at).toLocaleDateString()}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
