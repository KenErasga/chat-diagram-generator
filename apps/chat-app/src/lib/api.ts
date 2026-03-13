export interface ChatRequest {
  chatId: string;
  message: string;
}

export interface ChatResponse {
  type: 'diagram' | 'message';
  content: string;
  diagram?: string;
}

export async function postChat(req: ChatRequest): Promise<ChatResponse> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req)
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<ChatResponse>;
}
