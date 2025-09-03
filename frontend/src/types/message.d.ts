// enums you can also mirror in the DB
export type MessageRole = "user" | "assistant" | "system";

export interface Chat {
  id: string;              // UUID
  userId?: string;         // make required once auth is in
  title?: string | null;   // allow auto-generated or null
  createdAt: Date;
  updatedAt: Date;
  // optional denorm fields for performance
  lastMessageAt?: Date | null;
  messageCount?: number;   // maintained by triggers or app
}

export interface Message {
  id: string;              // UUID
  chatId: string;          // UUID → FK to Chat
  userId?: string;         // for multi-user; assistant/system can be null
  role: MessageRole;       // "user" | "assistant" | "system"
  content: string;         // the text of the message
  createdAt: Date;

  // optional extras that help a lot
  meta?: {
    model?: string;        // "gpt-4o", etc.
    tokensIn?: number;
    tokensOut?: number;
    latencyMs?: number;
  };

  // lightweight attachment support
  attachments?: Array<{
    type: "file" | "link";
    url: string;           // Supabase Storage URL or external link
    mimeType?: string;
    name?: string;
    sizeBytes?: number;
  }>;
}

// export interface Message {
//     id?: string
//     role: 'user' | 'assistant' | 'system'
//     content: string
//     attachments?: FileAttachment[]
//     timestamp?: Date
// }

// export interface FileAttachment {
//     id: string
//     name: string
//     type: string
//     size: number
//     url?: string
//     content?: string
// }

// export interface ChatResponse {
//     message: Message
//     context?: string[]
//     suggestions?: string[]
// }


