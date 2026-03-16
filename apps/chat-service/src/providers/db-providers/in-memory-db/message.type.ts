export interface Message {
  role: 'user' | 'ai';
  content: string;
  diagram?: string;
}
