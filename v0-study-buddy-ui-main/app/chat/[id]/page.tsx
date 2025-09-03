"use client"

import type React from "react"
import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
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
  ArrowLeft,
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

const PLACEHOLDER_CHAT_HISTORY = [
  { id: "1", title: "AI study guide pipeline", timestamp: "2024-01-15" },
  { id: "2", title: "Create statement in SQL", timestamp: "2024-01-14" },
  { id: "3", title: "2D DP in LCS", timestamp: "2024-01-13" },
  { id: "4", title: "Smarter arrangement counting", timestamp: "2024-01-12" },
  { id: "5", title: "LeetCode carfleet topics", timestamp: "2024-01-11" },
  { id: "6", title: "DAG with disconnected pieces", timestamp: "2024-01-10" },
  { id: "7", title: "Asymptotic bounds Q1 Q5 Q6", timestamp: "2024-01-09" },
  { id: "8", title: "Jurchen sentence meaning", timestamp: "2024-01-08" },
]

const PLACEHOLDER_USER = {
  id: "user-1",
  name: "Bob Jones",
  initials: "BJ",
  plan: "Plus",
}

export default function ChatPage() {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Array<{ id: string; text: string; sender: "user" | "ai" }>>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [chatTitle, setChatTitle] = useState("")

  const [sidebarItems] = useState(PLACEHOLDER_SIDEBAR_ITEMS)
  const [chatHistory] = useState(PLACEHOLDER_CHAT_HISTORY)
  const [user] = useState(PLACEHOLDER_USER)

  const router = useRouter()
  const params = useParams()
  const chatId = params.id as string

  useEffect(() => {
    // Load chat data based on chatId
    const existingChat = chatHistory.find((chat) => chat.id === chatId)
    if (existingChat) {
      setChatTitle(existingChat.title)
      // Load existing messages for this chat
    } else {
      setChatTitle("New Chat")
    }
  }, [chatId, chatHistory])

  const generateUUID = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c == "x" ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  const handleNewChat = () => {
    const newChatId = generateUUID()
    router.push(`/chat/${newChatId}`)
  }

  const handleSidebarItemClick = (item: (typeof PLACEHOLDER_SIDEBAR_ITEMS)[0]) => {
    if (item.label === "New chat") {
      handleNewChat()
    }
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

  const handleSend = () => {
    if (!message.trim() && uploadedFiles.length === 0) return

    let messageText = message
    if (uploadedFiles.length > 0) {
      const fileNames = uploadedFiles.map((f) => f.name).join(", ")
      messageText += uploadedFiles.length > 0 ? ` [Files: ${fileNames}]` : ""
    }

    const newMessage = {
      id: Date.now().toString(),
      text: messageText,
      sender: "user" as const,
    }

    setMessages((prev) => [...prev, newMessage])
    setMessage("")
    setUploadedFiles([])

    // Update chat title if it's the first message
    if (messages.length === 0 && chatTitle === "New Chat") {
      const title = message.slice(0, 50) + (message.length > 50 ? "..." : "")
      setChatTitle(title)
    }

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        text: "I'm here to help! What would you like to know or discuss?",
        sender: "ai" as const,
      }
      setMessages((prev) => [...prev, aiResponse])
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleProfileClick = () => {
    router.push("/profile")
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar currentChatId={chatId} />
      <SidebarInset>
        <div className="flex h-screen flex-col">
          <div className="border-b border-border bg-background px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <SidebarTrigger />
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 mr-2" onClick={() => router.push("/")}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <span className="font-semibold">{chatTitle}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 px-3 py-2"
                  onClick={handleProfileClick}
                >
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-white">{user.initials}</span>
                  </div>
                  <span className="text-sm font-medium hidden sm:inline">{user.name}</span>
                  <ChevronDown className="w-3 h-3" />
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
              {messages.length === 0 ? (
                <div className="text-center">
                  <h1 className="text-3xl font-semibold text-foreground mb-8">Where should we begin?</h1>
                  <p className="text-muted-foreground">Chat ID: {chatId}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                          msg.sender === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {msg.text}
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
  )
}
