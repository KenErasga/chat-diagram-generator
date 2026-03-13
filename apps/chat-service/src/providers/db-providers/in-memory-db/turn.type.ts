export interface Turn {
  role: 'user' | 'ai';
  content: string;
  diagram?: string;
}
