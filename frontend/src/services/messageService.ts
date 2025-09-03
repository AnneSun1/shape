import { apiClient } from './apiClient';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface MessageCreate {
  chatId?: string; // Optional - if not provided, new chat will be created
  role: MessageRole;
  content: string;
}

export interface MessageOut {
  id: string;
  chatId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

export interface MessageResponse {
  id: string;
  chatId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

export class MessageService {
  private apiClient = apiClient;

  async createMessage(messageData: MessageCreate): Promise<MessageResponse> {
    return await this.apiClient.post<MessageResponse>('/messages', messageData);
  }

  async getMessagesByChat(chatId: string): Promise<MessageOut[]> {
    console.log('Fetching messages for chat:', chatId);
    const response = await this.apiClient.get<MessageOut[]>(`/messages/by-chat/${chatId}`);
    console.log('Messages response:', response);
    return response;
  }

  async sendUserMessage(content: string, chatId?: string): Promise<MessageResponse> {
    const messageData: MessageCreate = {
      role: 'user',
      content,
      chatId,
    };
    return await this.createMessage(messageData);
  }

  async sendAssistantMessage(content: string, chatId: string): Promise<MessageResponse> {
    const messageData: MessageCreate = {
      role: 'assistant',
      content,
      chatId,
    };
    return await this.createMessage(messageData);
  }
}

export const messageService = new MessageService();