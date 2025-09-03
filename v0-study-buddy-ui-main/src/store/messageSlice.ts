import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { messageService, MessageOut, MessageCreate, MessageResponse } from '@/services/messageService';

interface MessageState {
  messages: MessageOut[];
  loading: boolean;
  error: string | null;
  currentChatId: string | null;
}

const initialState: MessageState = {
  messages: [],
  loading: false,
  error: null,
  currentChatId: null,
};

export const fetchMessagesByChat = createAsyncThunk(
  'message/fetchMessagesByChat',
  async (chatId: string) => {
    const response = await messageService.getMessagesByChat(chatId);
    return { chatId, messages: response };
  }
);

export const sendUserMessage = createAsyncThunk(
  'message/sendUserMessage',
  async (payload: { content: string; chatId?: string }) => {
    const response = await messageService.sendUserMessage(payload.content, payload.chatId);
    return response;
  }
);

export const sendAssistantMessage = createAsyncThunk(
  'message/sendAssistantMessage',
  async (payload: { content: string; chatId: string }) => {
    const response = await messageService.sendAssistantMessage(payload.content, payload.chatId);
    return response;
  }
);

const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setCurrentChatId: (state, action) => {
      state.currentChatId = action.payload;
    },
    clearCurrentChatId: (state) => {
      state.currentChatId = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Messages by Chat
    builder.addCase(fetchMessagesByChat.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchMessagesByChat.fulfilled, (state, action) => {
      state.loading = false;
      state.messages = action.payload.messages;
      state.currentChatId = action.payload.chatId;
    });
    builder.addCase(fetchMessagesByChat.rejected, (state, action) => {
      state.error = action.error.message || 'Failed to fetch messages';
      state.loading = false;
    });

    // Send User Message
    builder.addCase(sendUserMessage.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(sendUserMessage.fulfilled, (state, action) => {
      state.loading = false;
      state.messages.push(action.payload);
      state.currentChatId = action.payload.chatId;
      
      // If this was a new chat (no previous currentChatId), 
      // we need to refresh the chat list to include the new chat
      if (!state.currentChatId) {
        // This will be handled by the chat slice
        console.log('New chat created, chatId:', action.payload.chatId);
      }
    });
    builder.addCase(sendUserMessage.rejected, (state, action) => {
      state.error = action.error.message || 'Failed to send message';
      state.loading = false;
    });

    // Send Assistant Message
    builder.addCase(sendAssistantMessage.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(sendAssistantMessage.fulfilled, (state, action) => {
      state.loading = false;
      state.messages.push(action.payload);
    });
    builder.addCase(sendAssistantMessage.rejected, (state, action) => {
      state.error = action.error.message || 'Failed to send assistant message';
      state.loading = false;
    });
  },
});

export const { addMessage, clearMessages, setError, setCurrentChatId, clearCurrentChatId } = messageSlice.actions;
export default messageSlice.reducer;

