import { useAppSelector, useAppDispatch } from '@/store';
import { 
  fetchMessagesByChat, 
  sendUserMessage, 
  sendAssistantMessage, 
  addMessage, 
  clearMessages, 
  setCurrentChatId, 
  clearCurrentChatId,
  setError
} from '@/store/messageSlice';

export const useMessage = () => {
  const dispatch = useAppDispatch();
  const messageState = useAppSelector((state) => state.message);
  
  // Ensure we have a valid state object
  const safeState = messageState || {
    messages: [],
    loading: false,
    error: null,
    currentChatId: null,
  };
  
  const { messages, loading, error, currentChatId } = safeState;

  const handleFetchMessagesByChat = async (chatId: string) => {
    console.log('Fetching messages for chat ID:', chatId);
    return await dispatch(fetchMessagesByChat(chatId));
  };

  const handleSendUserMessage = async (content: string, chatId?: string) => {
    return await dispatch(sendUserMessage({ content, chatId }));
  };

  const handleSendAssistantMessage = async (content: string, chatId: string) => {
    return await dispatch(sendAssistantMessage({ content, chatId }));
  };

  const handleAddMessage = (message: any) => {
    dispatch(addMessage(message));
  };

  const handleClearMessages = () => {
    dispatch(clearMessages());
  };

  const handleSetCurrentChatId = (chatId: string) => {
    dispatch(setCurrentChatId(chatId));
  };

  const handleClearCurrentChatId = () => {
    dispatch(clearCurrentChatId());
  };

  const handleSetError = (error: string) => {
    dispatch(setError(error));
  };

  return {
    messages,
    loading,
    error,
    currentChatId,
    fetchMessagesByChat: handleFetchMessagesByChat,
    sendUserMessage: handleSendUserMessage,
    sendAssistantMessage: handleSendAssistantMessage,
    addMessage: handleAddMessage,
    clearMessages: handleClearMessages,
    setCurrentChatId: handleSetCurrentChatId,
    clearCurrentChatId: handleClearCurrentChatId,
    setError: handleSetError,
  };
};
