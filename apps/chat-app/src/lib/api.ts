export interface ChatRequest {
  chatId: string;
  message: string;
}

export interface ChatResponse {
  type: 'diagram' | 'message';
  content: string;
  diagram?: string;
}

const REQUEST_TIMEOUT_MS = 30000;

export async function postChat(req: ChatRequest): Promise<ChatResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return response.json() as Promise<ChatResponse>;
  } finally {
    clearTimeout(timeoutId);
  }
}
