import { useEffect, useState } from 'react'

import { fetchMetrics } from '../lib/api'
import type { MetricsResponse } from '../types'

export function AnalyticsPage() {
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null)

  useEffect(() => {
    void fetchMetrics().then(setMetrics)
  }, [])

  if (!metrics) {
    return (
      <div className="max-w-6xl mx-auto w-full">
        <div className="rounded-[24px] border border-white/10 bg-white/5 p-8 text-center text-sm text-ink-200/50 shadow-soft backdrop-blur">
          Loading analytics metrics...
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto w-full space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total queries" value={metrics.total_queries.toString()} />
        <StatCard label="Average latency" value={`${metrics.average_latency.toFixed(2)}s`} />
        <StatCard label="Avg retrieval score" value={metrics.average_retrieval_score.toFixed(4)} />
        <StatCard label="Avg grounding score" value={metrics.average_grounding_score.toFixed(4)} />
      </div>

      {/* Two-Column Middle Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Panel title="Quality & Feedback">
          <div className="grid gap-3 grid-cols-3">
            <MiniMetric label="Helpful" value={metrics.helpful_feedback.toString()} tone="mint" />
            <MiniMetric label="Not Helpful" value={metrics.not_helpful_feedback.toString()} tone="sand" />
            <MiniMetric label="Hallucinations" value={metrics.hallucination_warnings.toString()} tone="red" />
          </div>
        </Panel>

        <Panel title="Most Searched Documents">
          <div className="space-y-2">
            {metrics.most_searched_documents.length === 0 ? (
              <div className="text-xs text-ink-300/40 py-4 text-center">No search activity recorded yet.</div>
            ) : (
              metrics.most_searched_documents.map((document) => (
                <div
                  key={document.document}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-ink-950/20 px-4 py-3"
                >
                  <span className="text-xs font-semibold text-white truncate pr-4">{document.document}</span>
                  <span className="text-xs font-mono font-bold text-mint-300 bg-mint-500/15 border border-mint-500/25 px-2.5 py-0.5 rounded-full shrink-0">
                    {document.count} searches
                  </span>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>

      {/* Recent Activity */}
      <Panel title="Recent Activity Logs">
        <div className="space-y-3">
          {metrics.recent_activity.length === 0 ? (
            <div className="text-xs text-ink-300/40 py-8 text-center">No recent query activity.</div>
          ) : (
            metrics.recent_activity.map((activity) => (
              <div
                key={activity.id}
                className="rounded-xl border border-white/5 bg-ink-950/25 p-4 space-y-3 hover:bg-ink-950/40 transition"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-white font-mono bg-white/5 px-2 py-0.5 rounded">
                      User Query
                    </span>
                    {activity.trace_id && (
                      <span className="text-[10px] text-ink-300/40 font-mono">
                        Trace: {activity.trace_id}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-ink-300/40 font-mono">
                    {new Date(activity.timestamp).toLocaleString()}
                  </span>
                </div>

                <div className="text-sm font-semibold text-white">{activity.question}</div>
                <div className="text-xs text-ink-200/70 leading-relaxed bg-white/5 border border-white/5 rounded-xl p-3 whitespace-pre-wrap">
                  {activity.answer}
                </div>

                <div className="flex flex-wrap gap-4 text-[10px] text-ink-300/50 font-mono">
                  <span>Retrieval: {activity.retrieval_score.toFixed(4)}</span>
                  <span>Grounding: {activity.grounding_score.toFixed(4)}</span>
                  <span>Latency: {(activity.retrieval_time + activity.generation_time).toFixed(2)}s</span>
                  {activity.hallucination_warning && (
                    <span className="text-red-400 font-bold">⚠️ Potential Hallucination</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Panel>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/5 p-5 shadow-soft backdrop-blur flex flex-col justify-between">
      <div className="text-[10px] uppercase tracking-wider text-ink-200/50 font-semibold">{label}</div>
      <div className="mt-4 text-2xl font-bold text-white tracking-tight">{value}</div>
    </div>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur">
      <h3 className="text-base font-bold text-white tracking-tight border-b border-white/5 pb-3 mb-4">{title}</h3>
      <div>{children}</div>
    </div>
  )
}

function MiniMetric({ label, value, tone }: { label: string; value: string; tone: 'mint' | 'sand' | 'red' }) {
  const borderStyle =
    tone === 'mint'
      ? 'border-mint-500/20 bg-mint-500/5 text-mint-300'
      : tone === 'sand'
        ? 'border-sand-300/20 bg-sand-300/5 text-sand-200'
        : 'border-red-400/20 bg-red-400/5 text-red-300'

  return (
    <div className={`rounded-xl border p-4 text-center ${borderStyle}`}>
      <div className="text-[10px] uppercase tracking-wider opacity-60 font-semibold">{label}</div>
      <div className="mt-2 text-xl font-bold">{value}</div>
    </div>
  )
}
