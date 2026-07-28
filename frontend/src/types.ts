export type SourceItem = {
  document: string
  page: number | null
  score: number
}

export type QueryResponse = {
  trace_id: string | null
  answer: string
  sources: SourceItem[]
  retrieval_score: number
  grounding_score: number
  retrieval_time: number
  generation_time: number
  low_confidence_warning: boolean
  hallucination_warning: boolean
}

export type FeedbackPayload = {
  trace_id: string | null
  question: string
  answer: string
  feedback: string
  retrieval_score: number
  grounding_score: number
}

export type DocumentItem = {
  filename: string
  path: string
  size_bytes: number
  uploaded_at: string
  is_uploaded: boolean
}

export type UploadResponse = {
  filename: string
  path: string
  chunk_count: number
}

export type MetricsResponse = {
  total_queries: number
  average_latency: number
  average_retrieval_score: number
  average_grounding_score: number
  hallucination_warnings: number
  helpful_feedback: number
  not_helpful_feedback: number
  most_searched_documents: Array<{ document: string; count: number }>
  recent_activity: Array<{
    id: number
    trace_id: string | null
    question: string
    answer: string
    retrieval_score: number
    grounding_score: number
    retrieval_time: number
    generation_time: number
    hallucination_warning: boolean
    timestamp: string
  }>
}
