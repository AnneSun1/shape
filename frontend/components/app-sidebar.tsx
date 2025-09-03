"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Logo } from "@/components/logo"
import { PenSquare, Search, Library, Code2, Play, Grid3X3, FolderPlus } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useChat } from "@/hooks/useChat"

const PLACEHOLDER_SIDEBAR_ITEMS = [
  { id: "1", icon: PenSquare, label: "New chat", action: "new-chat" },
  { id: "2", icon: Search, label: "Search chats", action: "search" },
  { id: "3", icon: Library, label: "Library", action: "library" },
  { id: "4", icon: Code2, label: "Codex", action: "codex" },
  { id: "5", icon: Play, label: "Sora", action: "sora" },
  { id: "6", icon: Grid3X3, label: "GPTs", action: "gpts" },
  { id: "7", icon: FolderPlus, label: "New project", action: "new-project" },
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

interface AppSidebarProps {
  onChatSelect?: (chat: any) => void
  onNewChat?: () => void
}

export function AppSidebar({ onChatSelect, onNewChat }: AppSidebarProps) {
  const [sidebarItems] = useState(PLACEHOLDER_SIDEBAR_ITEMS)
  const { user } = useAuth()
  const { chats, currentChat, createChat } = useChat()
  const router = useRouter()

  const generateUUID = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c == "x" ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  const handleNewChat = () => {
    // Just navigate to the new chat interface, don't create a chat yet
    if (onNewChat) {
      onNewChat();
    }
  }

  const handleSidebarItemClick = (action: string) => {
    switch (action) {
      case "new-chat":
        handleNewChat()
        break
      // Add other actions as needed
      default:
        break
    }
  }

  const handleChatClick = (chat: any) => {
    if (onChatSelect) {
      onChatSelect(chat);
    }
  }

  return (
    <Sidebar collapsible="offcanvas" className="border-r">
      <SidebarHeader className="border-b">
        <div className="flex items-center space-x-2 px-2">
          <Logo size="sm" />
          <span className="font-semibold text-sidebar-foreground">Shape AI</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => handleSidebarItemClick(item.action)}
                    className="w-full justify-start"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupContent>
            <div className="px-2 py-2">
              <h3 className="text-xs font-medium text-muted-foreground mb-2">Chats</h3>
            </div>
            <SidebarMenu className="max-h-96 overflow-y-auto">
              {chats.map((chat) => (
                <SidebarMenuItem key={chat.id}>
                  <SidebarMenuButton
                    onClick={() => handleChatClick(chat)}
                    isActive={chat.id === currentChat?.id}
                    className="w-full justify-start text-sm"
                    tooltip={chat.title}
                  >
                    <span className="truncate">{chat.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => router.push("/profile")} className="w-full justify-start">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-white">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">{user?.email || 'User'}</span>
                <span className="text-xs text-muted-foreground">Free Plan</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
