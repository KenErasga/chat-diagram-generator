'use client';

import { useState } from 'react';
import { ChatPanel } from '@/components/ChatPanel';
import { DiagramPanel } from '@/components/DiagramPanel';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function Page() {
  const [currentDiagram, setCurrentDiagram] = useState<string | null>(null);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <ErrorBoundary>
        <div style={{ width: '50%' }}>
          <ChatPanel onDiagram={setCurrentDiagram} />
        </div>
      </ErrorBoundary>
      <ErrorBoundary>
        <div style={{ width: '50%' }}>
          <DiagramPanel diagram={currentDiagram} />
        </div>
      </ErrorBoundary>
    </div>
  );
}
