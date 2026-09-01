export interface ChatMessage {
  id?: string;
  text: string;
  sender: 'user' | 'bot';
  createdAt: number;
}

export interface ChatSession {
  id?: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}
