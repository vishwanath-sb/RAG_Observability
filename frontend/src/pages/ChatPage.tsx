import { useState } from 'react'

import { queryAssistant, sendFeedback } from '../lib/api'
import type { QueryResponse } from '../types'
import { LoadingDots } from '../components/LoadingDots'

type Message = {
  id: string
  role: 'user' | 'assistant'
  question?: string
  answer?: string
  response?: QueryResponse
  feedbackState?: 'helpful' | 'not_helpful' | 'pending'
  status?: 'loading' | 'done' | 'error'
  error?: string
}

export function ChatPage() {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedQuestion = question.trim()
    if (!trimmedQuestion || isSubmitting) {
      return
    }

    setIsSubmitting(true)
    setQuestion('')

    const userMessageId = crypto.randomUUID()
    const assistantMessageId = crypto.randomUUID()

    setMessages((current) => [
      ...current,
      { id: userMessageId, role: 'user', question: trimmedQuestion },
      {
        id: assistantMessageId,
        role: 'assistant',
        question: trimmedQuestion,
        status: 'loading',
        feedbackState: 'pending',
      },
    ])

    try {
      const response = await queryAssistant(trimmedQuestion)

      setMessages((current) =>
        current.map((message) =>
          message.id === assistantMessageId
            ? {
                ...message,
                status: 'done',
                answer: response.answer,
                response,
                question: message.question ?? trimmedQuestion,
                feedbackState: 'pending',
              }
            : message,
        ),
      )
    } catch (error) {
      setMessages((current) =>
        current.map((message) =>
          message.id === assistantMessageId
            ? {
                ...message,
                status: 'error',
                error: error instanceof Error ? error.message : 'Request failed.',
              }
            : message,
        ),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleFeedback(messageId: string, feedback: 'helpful' | 'not helpful') {
    const target = messages.find((message) => message.id === messageId)
    if (!target?.response) {
      return
    }

    if (!target.question || !target.answer) {
      return
    }

    await sendFeedback({
      trace_id: target.response.trace_id,
      question: target.question,
      answer: target.answer,
      feedback,
      retrieval_score: target.response.retrieval_score,
      grounding_score: target.response.grounding_score,
    })

    setMessages((current) =>
      current.map((message) =>
        message.id === messageId
          ? { ...message, feedbackState: feedback === 'helpful' ? 'helpful' : 'not_helpful' }
          : message,
      ),
    )
  }

  return (
    <div className="max-w-4xl mx-auto w-full h-full flex flex-col min-h-0">
      <div className="flex flex-col flex-1 min-h-0 rounded-[24px] border border-white/10 bg-white/5 shadow-soft backdrop-blur">
        <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-300">Chat Assistant</span>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={() => setMessages([])}
              className="text-xs text-ink-300 hover:text-white transition"
            >
              Clear Chat
            </button>
          )}
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 px-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 mb-6">
                <svg className="w-6 h-6 text-mint-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">How can I help you today?</h2>
              <p className="text-sm text-ink-200/60 max-w-md mb-8">
                Ask questions about enterprise policy documents, retrieve cited sources, and inspect grounding scores.
              </p>
              <div className="grid gap-3 sm:grid-cols-2 max-w-lg w-full">
                {[
                  "What law authorizes NIST to develop security standards?",
                  "Summarize the key requirements for NIST SP 800-53.",
                ].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQuestion(q)}
                    className="p-4 rounded-xl border border-white/10 bg-white/5 text-left text-xs text-ink-100 hover:bg-white/10 hover:border-white/20 transition duration-150"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {messages.map((message) => {
            if (message.role === 'user') {
              return (
                <div key={message.id} className="flex justify-end mb-4">
                  <div className="max-w-[80%] rounded-[20px] bg-white/10 border border-white/15 px-5 py-3 text-sm leading-6 text-white">
                    {message.question}
                  </div>
                </div>
              )
            }

            return (
              <div key={message.id} className="rounded-[20px] border border-white/10 bg-white/5 p-6 space-y-5 mb-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-mint-500 flex items-center justify-center text-[10px] text-ink-950 font-bold">
                    AI
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink-300">Policy Assistant</span>
                </div>

                {message.status === 'loading' ? (
                  <div className="space-y-3 py-2">
                    <div className="text-xs text-ink-200/50 italic flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin text-mint-400" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Searching document corpus and synthesizing response...
                    </div>
                  </div>
                ) : null}

                {message.status === 'error' ? (
                  <div className="text-sm text-red-300">{message.error}</div>
                ) : null}

                {message.status === 'done' && message.response ? (
                  <div className="space-y-5">
                    <div className="whitespace-pre-wrap text-sm leading-7 text-ink-50">{message.answer}</div>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-b border-white/5 py-3 text-xs text-ink-200/60">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-white">Retrieval Score:</span>
                        <span>{message.response.retrieval_score.toFixed(4)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-white">Grounding Score:</span>
                        <span>{message.response.grounding_score.toFixed(4)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-white">Latency:</span>
                        <span>{(message.response.retrieval_time + message.response.generation_time).toFixed(2)}s</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                      {message.response.low_confidence_warning ? (
                        <Badge tone="warning">Low confidence</Badge>
                      ) : null}
                      {message.response.hallucination_warning ? (
                        <Badge tone="danger">Potential hallucination</Badge>
                      ) : null}
                    </div>

                    {message.response.sources.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-[10px] uppercase tracking-wider text-ink-300 font-semibold">Sources Cited</div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {message.response.sources.map((source) => (
                            <div
                              key={`${source.document}-${source.page ?? 'na'}-${source.score}`}
                              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs"
                            >
                              <div className="truncate pr-2">
                                <div className="font-medium text-white truncate" title={source.document}>
                                  {source.document}
                                </div>
                                <div className="text-[10px] text-ink-300/50 mt-0.5">
                                  Page {source.page ?? 'n/a'}
                                </div>
                              </div>
                              <div className="text-[10px] font-mono text-mint-300 shrink-0 bg-mint-500/10 px-2 py-0.5 rounded border border-mint-500/20">
                                {source.score.toFixed(4)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleFeedback(message.id, 'helpful')}
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                            message.feedbackState === 'helpful'
                              ? 'bg-mint-500 text-ink-950 shadow-soft'
                              : 'border border-white/15 bg-white/5 text-white hover:bg-white/10'
                          }`}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                          </svg>
                          Helpful
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFeedback(message.id, 'not helpful')}
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                            message.feedbackState === 'not_helpful'
                              ? 'bg-red-500 text-white shadow-soft'
                              : 'border border-white/15 bg-white/5 text-white hover:bg-white/10'
                          }`}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m7-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                          </svg>
                          Not Helpful
                        </button>
                      </div>
                      {message.response.trace_id ? (
                        <span className="text-[10px] font-mono text-ink-300/40">
                          ID: {message.response.trace_id}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>

        <form onSubmit={handleSubmit} className="border-t border-white/10 p-5 bg-white/5 rounded-b-[24px]">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-ink-950/40 p-2.5 focus-within:border-mint-400/50 transition">
            <input
              type="text"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask a policy question..."
              disabled={isSubmitting}
              className="flex-1 bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-ink-300/40"
            />
            <button
              type="submit"
              disabled={isSubmitting || !question.trim()}
              className="rounded-xl bg-mint-500 hover:bg-mint-400 text-ink-950 p-2.5 transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Badge({ children, tone }: { children: string; tone: 'warning' | 'danger' | 'neutral' }) {
  const styles =
    tone === 'warning'
      ? 'border-sand-300/20 bg-sand-300/10 text-sand-100'
      : tone === 'danger'
        ? 'border-red-400/20 bg-red-400/10 text-red-100'
        : 'border-white/10 bg-white/5 text-ink-100/80'

  return <span className={`rounded-full border px-3 py-1 ${styles}`}>{children}</span>
}
