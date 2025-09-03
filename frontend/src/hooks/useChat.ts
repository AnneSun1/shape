import { useAppSelector, useAppDispatch } from '@/store';
import { createChat, fetchChats, fetchChatById, setCurrentChat, clearCurrentChat, clearError, setCurrentChatById } from '@/store/chatSlice';
import { ChatCreate } from '@/services/chatService';

export const useChat = () => {
  const dispatch = useAppDispatch();
  const chatState = useAppSelector((state) => state.chat);
  
  // Debug logging
  console.log('Chat state:', chatState);
  
  // Ensure we have a valid state object
  const safeState = chatState || {
    chats: [],
    currentChat: null,
    loading: false,
    error: null,
  };
  
  const { chats, currentChat, loading, error } = safeState;

  const handleCreateChat = async (chatData: ChatCreate) => {
    return await dispatch(createChat(chatData));
  };

  const handleFetchChats = async () => {
    console.log('fetchChats function:', fetchChats);
    console.log('dispatch function:', dispatch);
    
    if (!fetchChats || typeof fetchChats !== 'function') {
      console.error('fetchChats is not a function:', fetchChats);
      return;
    }
    
    if (!dispatch || typeof dispatch !== 'function') {
      console.error('dispatch is not a function:', dispatch);
      return;
    }
    
    try {
      return await dispatch(fetchChats());
    } catch (error) {
      console.error('Error dispatching fetchChats:', error);
      throw error;
    }
  };

  const handleFetchChatById = async (chatId: string) => {
    return await dispatch(fetchChatById(chatId));
  };

  const handleSetCurrentChat = (chat: any) => {
    console.log('Setting current chat:', chat);
    dispatch(setCurrentChat(chat));
  };

  const handleSetCurrentChatById = (chatId: string) => {
    console.log('Setting current chat by ID:', chatId);
    dispatch(setCurrentChatById(chatId));
  };

  const handleClearCurrentChat = () => {
    dispatch(clearCurrentChat());
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  return {
    chats,
    currentChat,
    loading,
    error,
    createChat: handleCreateChat,
    fetchChats: handleFetchChats,
    fetchChatById: handleFetchChatById,
    setCurrentChat: handleSetCurrentChat,
    setCurrentChatById: handleSetCurrentChatById,
    clearCurrentChat: handleClearCurrentChat,
    clearError: handleClearError,
  };
};
