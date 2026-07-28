import { useState } from 'react'

import { AppShell } from './components/AppShell'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { ChatPage } from './pages/ChatPage'
import { DocumentsPage } from './pages/DocumentsPage'
import { UploadPage } from './pages/UploadPage'

type ViewName = 'chat' | 'upload' | 'documents' | 'analytics'

export default function App() {
  const [activeView, setActiveView] = useState<ViewName>('chat')

  return (
    <AppShell activeView={activeView} onChangeView={setActiveView}>
      {activeView === 'chat' ? <ChatPage /> : null}
      {activeView === 'upload' ? <UploadPage /> : null}
      {activeView === 'documents' ? <DocumentsPage /> : null}
      {activeView === 'analytics' ? <AnalyticsPage /> : null}
    </AppShell>
  )
}
