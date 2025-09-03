"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { useAuth } from "@/hooks/useAuth"
import { useChat } from "@/hooks/useChat"
import { useMessage } from "@/hooks/useMessage"
import {
  PenSquare,
  Search,
  Library,
  Code2,
  Play,
  Grid3X3,
  FolderPlus,
  Mic,
  ArrowUp,
  X,
  ChevronDown,
  Paperclip,
  LogOut,
} from "lucide-react"

const PLACEHOLDER_SIDEBAR_ITEMS = [
  { id: "1", icon: PenSquare, label: "New chat" },
  { id: "2", icon: Search, label: "Search chats" },
  { id: "3", icon: Library, label: "Library" },
  { id: "4", icon: Code2, label: "Codex" },
  { id: "5", icon: Play, label: "Sora" },
  { id: "6", icon: Grid3X3, label: "GPTs" },
  { id: "7", icon: FolderPlus, label: "New project" },
]

function ChatInterface() {
  const [message, setMessage] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  const { user, logout } = useAuth()
  const { chats, currentChat, loading: chatLoading, fetchChats, createChat, setCurrentChat, setCurrentChatById } = useChat()
  const { messages, currentChatId, loading: messageLoading, sendUserMessage, fetchMessagesByChat } = useMessage()

  const [sidebarItems] = useState(PLACEHOLDER_SIDEBAR_ITEMS)

  // Fetch chats when user is authenticated
  useEffect(() => {
    console.log('Chat component mounted, user:', user);
    if (user && fetchChats && typeof fetchChats === 'function') {
      console.log('Fetching chats for user:', user.email);
      fetchChats().catch(error => {
        console.error('Error fetching chats:', error);
      });
    } else if (!user) {
      console.log('No user authenticated, skipping chat fetch');
    } else {
      console.error('fetchChats is not available:', fetchChats);
    }
  }, [user]) // Only depend on user, not fetchChats

  // Fetch messages when a chat is selected
  useEffect(() => {
    if (currentChat && fetchMessagesByChat && typeof fetchMessagesByChat === 'function') {
      console.log('Fetching messages for selected chat:', currentChat.id);
      fetchMessagesByChat(currentChat.id).catch(error => {
        console.error('Error fetching messages:', error);
      });
    }
  }, [currentChat]) // Depend on currentChat

  // Refresh chat list when a new chat is created (when currentChatId changes from null to a value)
  useEffect(() => {
    if (currentChatId && !currentChat) {
      console.log('New chat created, refreshing chat list and setting current chat');
      fetchChats().then(() => {
        // After refreshing chats, set the current chat to the new one
        setCurrentChatById(currentChatId);
      }).catch(error => {
        console.error('Error refreshing chat list:', error);
      });
    }
  }, [currentChatId, currentChat, fetchChats, setCurrentChatById])

  const handleLogout = async () => {
    await logout()
  }

  const handleChatSelect = (chat: any) => {
    console.log('Selecting chat:', chat);
    setCurrentChat(chat);
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    setUploadedFiles((prev) => [...prev, ...files])
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setUploadedFiles((prev) => [...prev, ...files])
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSend = async () => {
    
    if (!message.trim() && uploadedFiles.length === 0) return
    
    let messageText = message
    if (uploadedFiles.length > 0) {
      const fileNames = uploadedFiles.map((f) => f.name).join(", ")
      messageText += uploadedFiles.length > 0 ? ` [Files: ${fileNames}]` : ""
    }
    console.log('Sending message:', message);
    try {
      // If no current chat, this will create a new chat via the backend
      // The backend handles creating a new chat when chatId is not provided
      const chatId = currentChat?.id;
      console.log(chatId)
      await sendUserMessage(messageText, chatId)
      setMessage("")
      setUploadedFiles([])
      
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }



  return (
    <ProtectedRoute>
      <SidebarProvider defaultOpen={false}>
        <AppSidebar 
          onChatSelect={handleChatSelect}
          onNewChat={() => {
            // Clear current chat to show new chat interface
            setCurrentChat(null);
          }}
        />
        <SidebarInset>
        <div className="flex h-screen flex-col">
          <div className="border-b border-border bg-background px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <SidebarTrigger />
                <span className="font-semibold">Study Buddy AI</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 px-3 py-2"
                  onClick={handleLogout}
                >
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-white">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="text-sm font-medium hidden sm:inline">
                    {user?.email || 'User'}
                  </span>
                  <LogOut className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div
            className={`flex-1 overflow-y-auto ${isDragOver ? "bg-muted/50" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isDragOver && (
              <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary z-10 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl mb-2">📁</div>
                  <p className="text-lg font-medium">Drop files here to upload</p>
                </div>
              </div>
            )}

            <div className="max-w-3xl mx-auto px-6 py-8">
              {currentChat ? (
                // Show chat header for existing chat
                <div className="mb-6 pb-4 border-b border-border">
                  <h2 className="text-xl font-semibold">{currentChat.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {currentChat.messageCount} messages • Last updated {new Date(currentChat.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                // Show new chat interface
                <div className="mb-6 pb-4 border-b border-border">
                  <h2 className="text-xl font-semibold">New Chat</h2>
                  <p className="text-sm text-muted-foreground">
                    Start a new conversation
                  </p>
                </div>
              )}
              
              {messages.length === 0 ? (
                <div className="text-center">
                  <h1 className="text-3xl font-semibold text-foreground mb-8">
                    {currentChat ? 'No messages yet' : 'Where should we begin?'}
                  </h1>
                  {!currentChat && (
                    <p className="text-muted-foreground mb-8">
                      Type your first message below to start a new conversation
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-border bg-background px-6 py-4">
            <div className="max-w-3xl mx-auto">
              {uploadedFiles.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-muted px-3 py-1 rounded-full text-sm">
                      <span>{file.name}</span>
                      <button onClick={() => removeFile(index)} className="text-muted-foreground hover:text-foreground">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="relative">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask anything"
                  className="pr-28 py-3 text-base bg-muted border-border focus:border-ring"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                  <label>
                    <input type="file" multiple onChange={handleFileInput} className="hidden" />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <Paperclip className="w-4 h-4" />
                    </Button>
                  </label>

                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                    <Mic className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={handleSend}
                    disabled={!message.trim() && uploadedFiles.length === 0}
                    size="sm"
                    className="h-8 w-8 p-0 bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
    </ProtectedRoute>
  )
}

export default ChatInterface
