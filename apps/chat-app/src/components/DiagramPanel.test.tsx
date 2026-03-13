import { render, screen, waitFor } from '@testing-library/react';
import { DiagramPanel } from './DiagramPanel';

jest.mock('mermaid', () => ({
  __esModule: true,
  default: {
    initialize: () => {},
    render: () => Promise.resolve({ svg: '<svg />', bindFunctions: undefined })
  }
}));

function getMermaidDefault() {
  return jest.requireMock('mermaid').default as {
    initialize: () => void;
    render: (id: string, def: string) => Promise<{ svg: string }>;
  };
}

describe('DiagramPanel', () => {
  it('shows placeholder when diagram is null', () => {
    render(<DiagramPanel diagram={null} />);

    expect(screen.getByText(/submit a message to generate a diagram/i)).toBeInTheDocument();
  });

  it('calls mermaid.render when diagram is provided', async () => {
    const renderSpy = jest.spyOn(getMermaidDefault(), 'render').mockResolvedValue({
      svg: '<svg>test</svg>',
      bindFunctions: undefined
    });

    render(<DiagramPanel diagram="flowchart TD\n  A --> B" />);

    await waitFor(() => expect(renderSpy).toHaveBeenCalled());

    renderSpy.mockRestore();
  });

  it('shows error state when mermaid.render throws', async () => {
    const renderSpy = jest.spyOn(getMermaidDefault(), 'render').mockRejectedValue(new Error('parse error'));

    render(<DiagramPanel diagram="invalid mermaid" />);

    await waitFor(() => expect(screen.getByText(/failed to render diagram/i)).toBeInTheDocument());

    renderSpy.mockRestore();
  });
});
