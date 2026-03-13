'use client';

import { useEffect, useId, useState } from 'react';

interface DiagramPanelProps {
  diagram: string | null;
}

export function DiagramPanel({ diagram }: DiagramPanelProps) {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const id = useId().replace(/:/g, '');

  useEffect(() => {
    if (!diagram) {
      setSvg(null);
      setError(null);

      return;
    }

    let cancelled = false;

    async function render() {
      try {
        const mermaid = await import('mermaid');

        mermaid.default.initialize({ startOnLoad: false });

        const { svg: rendered } = await mermaid.default.render(`diagram-${id}`, diagram!);

        if (!cancelled) {
          setSvg(rendered);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to render diagram');
          setSvg(null);
        }
      }
    }

    render();

    return () => {
      cancelled = true;
    };
  }, [diagram, id]);

  if (!diagram) {
    return (
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6b7280' }}
      >
        Submit a message to generate a diagram
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#991b1b' }}
      >
        Failed to render diagram: {error}
      </div>
    );
  }

  if (!svg) {
    return (
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6b7280' }}
      >
        Rendering...
      </div>
    );
  }

  return (
    <div style={{ overflow: 'auto', height: '100%', padding: '16px' }} dangerouslySetInnerHTML={{ __html: svg }} />
  );
}
