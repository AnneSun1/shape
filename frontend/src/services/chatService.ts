import { apiClient } from './apiClient';

export interface ChatCreate {
  title: string;
}

export interface ChatCreated {
  id: string;
  title: string;
}

export interface ChatOut {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt?: string;
  messageCount: number;
}

export class ChatService {
  private apiClient = apiClient;

  async createChat(chatData: ChatCreate): Promise<ChatCreated> {
    return await this.apiClient.post<ChatCreated>('/chats', chatData);
  }

  async getChats(): Promise<ChatOut[]> {
    console.log('Fetching chats from backend...');
    const response = await this.apiClient.get<ChatOut[]>('/chats');
    console.log('Chats response:', response);
    return response;
  }

  async getChatById(chatId: string): Promise<ChatOut> {
    console.log('Fetching chat by ID:', chatId);
    const response = await this.apiClient.get<ChatOut>(`/chats/${chatId}`);
    console.log('Chat response:', response);
    return response;
  }
}

export const chatService = new ChatService();
