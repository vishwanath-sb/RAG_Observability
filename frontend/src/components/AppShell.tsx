import type { ReactNode } from 'react'

type ViewName = 'chat' | 'upload' | 'documents' | 'analytics'

type Props = {
  activeView: ViewName
  onChangeView: (view: ViewName) => void
  children: ReactNode
}

const navItems: Array<{ id: ViewName; label: string; icon: ReactNode }> = [
  {
    id: 'chat',
    label: 'Chat Assistant',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    id: 'upload',
    label: 'Upload Document',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    ),
  },
  {
    id: 'documents',
    label: 'Policy Corpus',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
]

export function AppShell({ activeView, onChangeView, children }: Props) {
  return (
    <div className="min-h-screen bg-ink-950 text-ink-50">
      <div className="absolute inset-0 -z-10 bg-hero-grid" />
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-6 p-4 lg:p-6">
        <aside className="hidden w-72 shrink-0 flex-col justify-between rounded-[24px] border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur xl:flex">
          <div>
            <div className="mb-8 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-mint-500 to-mint-300 flex items-center justify-center shadow-lg shadow-mint-500/20">
                <svg className="w-5 h-5 text-ink-950" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-white">
                  PolicyAssistant
                </h1>
                <p className="text-[10px] uppercase tracking-[0.2em] text-ink-200/50">Enterprise RAG</p>
              </div>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => {
                const active = item.id === activeView
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onChangeView(item.id)}
                    className={`w-full flex items-center gap-3 rounded-xl px-4 py-3.5 text-left transition duration-200 ${
                      active
                        ? 'bg-white/10 text-white font-semibold shadow-soft border-l-4 border-mint-400'
                        : 'text-ink-200/75 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className={active ? 'text-mint-400' : 'text-ink-300/60'}>
                      {item.icon}
                    </span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="text-[10px] text-ink-300/40 text-center tracking-wider uppercase font-semibold">
            System Online • v0.1.0
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col gap-6">
          <header className="rounded-[24px] border border-white/10 bg-white/5 px-6 py-5 shadow-soft backdrop-blur flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white capitalize">
                {activeView === 'chat' ? 'Ask Policy Assistant' : activeView}
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-mint-400">
              <span className="w-2 h-2 rounded-full bg-mint-400 animate-pulse" />
              RAG Connected
            </div>
          </header>

          <div className="min-h-0 flex-1">{children}</div>
        </main>
      </div>
    </div>
  )
}
