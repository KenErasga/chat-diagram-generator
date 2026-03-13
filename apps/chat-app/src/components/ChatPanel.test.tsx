import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatPanel } from './ChatPanel';

jest.mock('@/lib/api', () => ({ postChat: jest.fn() }));
jest.mock('@/lib/chat-id', () => ({ getChatId: () => 'test-chat-id' }));

import { postChat } from '@/lib/api';

const mockPostChat = postChat as jest.MockedFunction<typeof postChat>;

describe('ChatPanel', () => {
  const onDiagram = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows submitted message in the list', async () => {
    mockPostChat.mockResolvedValue({ type: 'message', content: 'reply' });

    render(<ChatPanel onDiagram={onDiagram} />);
    await userEvent.type(screen.getByRole('textbox'), 'hello');
    await userEvent.click(screen.getByRole('button', { name: /send/i }));

    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('shows assistant reply for message response', async () => {
    mockPostChat.mockResolvedValue({ type: 'message', content: 'Got your message: hello' });

    render(<ChatPanel onDiagram={onDiagram} />);
    await userEvent.type(screen.getByRole('textbox'), 'hello');
    await userEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => expect(screen.getByText('Got your message: hello')).toBeInTheDocument());
    expect(onDiagram).not.toHaveBeenCalled();
  });

  it('calls onDiagram when response type is diagram', async () => {
    mockPostChat.mockResolvedValue({
      type: 'diagram',
      content: 'Here is your diagram.',
      diagram: 'flowchart TD\n  A --> B'
    });

    render(<ChatPanel onDiagram={onDiagram} />);
    await userEvent.type(screen.getByRole('textbox'), 'create a flowchart');
    await userEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => expect(onDiagram).toHaveBeenCalledWith('flowchart TD\n  A --> B'));
  });

  it('shows error message when fetch fails', async () => {
    mockPostChat.mockRejectedValue(new Error('network error'));

    render(<ChatPanel onDiagram={onDiagram} />);
    await userEvent.type(screen.getByRole('textbox'), 'hello');
    await userEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => expect(screen.getByText(/failed to send message/i)).toBeInTheDocument());
  });
});
