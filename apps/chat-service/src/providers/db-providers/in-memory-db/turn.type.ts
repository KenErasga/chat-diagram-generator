export interface Turn {
  role: 'user' | 'assistant';
  content: string;
  diagram?: string;
}
