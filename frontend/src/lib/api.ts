import type {
  DocumentItem,
  FeedbackPayload,
  MetricsResponse,
  QueryResponse,
  UploadResponse,
} from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, init)

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `Request failed with status ${response.status}`)
  }

  return (await response.json()) as T
}

export function queryAssistant(question: string): Promise<QueryResponse> {
  return requestJson<QueryResponse>('/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question }),
  })
}

export function sendFeedback(payload: FeedbackPayload): Promise<void> {
  return requestJson<void>('/feedback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
}

export async function uploadDocument(file: File): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append('file', file)

  return requestJson<UploadResponse>('/upload', {
    method: 'POST',
    body: formData,
  })
}

export function fetchDocuments(): Promise<DocumentItem[]> {
  return requestJson<DocumentItem[]>('/documents')
}

export function fetchMetrics(): Promise<MetricsResponse> {
  return requestJson<MetricsResponse>('/metrics')
}

export function fetchHistory(): Promise<unknown[]> {
  return requestJson<unknown[]>('/history')
}
