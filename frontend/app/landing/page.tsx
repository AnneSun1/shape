"use client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  PenSquare,
  Search,
  Library,
  Code2,
  Play,
  Grid3X3,
  FolderPlus,
  Menu,
  X,
  ChevronDown,
  Zap,
  Brain,
  MessageSquare,
  Users,
  Shield,
  Sparkles,
  ArrowRight,
  Star,
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
]

const PLACEHOLDER_USER = {
  id: "user-1",
  name: "Bob Jones",
  initials: "BJ",
  plan: "Plus",
}

const FEATURES = [
  {
    icon: Brain,
    title: "Advanced AI Reasoning",
    description: "Experience next-generation AI with enhanced reasoning capabilities and deeper understanding.",
  },
  {
    icon: MessageSquare,
    title: "Natural Conversations",
    description: "Engage in fluid, context-aware conversations that feel natural and intuitive.",
  },
  {
    icon: Code2,
    title: "Code Generation",
    description: "Generate, debug, and optimize code across multiple programming languages.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Get instant responses with our optimized AI infrastructure and processing power.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your conversations are secure and private with enterprise-grade encryption.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Share and collaborate on AI conversations with your team members.",
  },
]

const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "Software Engineer",
    content:
      "This AI has completely transformed how I approach coding problems. It's like having a senior developer mentor available 24/7.",
    rating: 5,
  },
  {
    name: "Marcus Rodriguez",
    role: "Product Manager",
    content:
      "The natural conversation flow and contextual understanding is incredible. It helps me brainstorm and refine ideas effortlessly.",
    rating: 5,
  },
  {
    name: "Emily Watson",
    role: "Data Scientist",
    content:
      "From data analysis to model optimization, this AI assistant has become an indispensable part of my workflow.",
    rating: 5,
  },
]

export default function LandingPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [sidebarItems] = useState(PLACEHOLDER_SIDEBAR_ITEMS)
  const [chatHistory] = useState(PLACEHOLDER_CHAT_HISTORY)
  const [user] = useState(PLACEHOLDER_USER)

  const router = useRouter()

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const handleProfileClick = () => {
    router.push("/profile")
  }

  const generateUUID = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c == "x" ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  const handleGetStarted = () => {
    const chatId = generateUUID()
    router.push(`/chat/${chatId}`)
  }

  const handleSidebarItemClick = (item: (typeof PLACEHOLDER_SIDEBAR_ITEMS)[0]) => {
    if (item.label === "New chat") {
      handleGetStarted()
    }
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar Overlay for mobile */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={toggleSidebar} />}

      {/* Sidebar */}
      <div
        className={`
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        fixed lg:relative lg:translate-x-0
        w-64 bg-sidebar border-r border-sidebar-border flex flex-col
        transition-transform duration-300 ease-in-out
        z-50 lg:z-auto
        h-full
      `}
      >
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-sm"></div>
              <span className="font-semibold text-sidebar-foreground">ChatGPT 5</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden h-8 w-8 p-0 text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={toggleSidebar}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 p-3 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={() => handleSidebarItemClick(item)}
            >
              <item.icon className="w-4 h-4 mr-3" />
              {item.label}
            </Button>
          ))}

          {/* Chat History */}
          <div className="pt-4">
            <h3 className="text-xs font-medium text-muted-foreground mb-2 px-3">Recent Chats</h3>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {chatHistory.map((chat) => (
                <Button
                  key={chat.id}
                  variant="ghost"
                  className="w-full justify-start text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground truncate"
                  title={chat.title}
                  onClick={() => router.push(`/chat/${chat.id}`)}
                >
                  {chat.title}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">{user.initials}</span>
            </div>
            <div>
              <div className="text-sm font-medium text-sidebar-foreground">{user.name}</div>
              <div className="text-xs text-muted-foreground">{user.plan}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header */}
        <div className="border-b border-border bg-background px-6 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="lg:hidden h-8 w-8 p-0 mr-2" onClick={toggleSidebar}>
                <Menu className="w-4 h-4" />
              </Button>
              <span className="font-semibold">ChatGPT 5</span>
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

        {/* Hero Section */}
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center space-x-2 bg-muted px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Introducing ChatGPT 5</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-balance mb-6">
              The Future of AI
              <br />
              <span className="text-primary">Conversation</span>
            </h1>
            <p className="text-xl text-muted-foreground text-balance mb-8 max-w-2xl mx-auto">
              Experience the most advanced AI assistant with enhanced reasoning, natural conversations, and powerful
              capabilities that adapt to your needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleGetStarted} className="text-lg px-8 py-3">
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-3 bg-transparent">
                Learn More
              </Button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
              Discover what makes ChatGPT 5 the most advanced AI assistant for your personal and professional needs.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                </div>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="bg-muted/30 py-16">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What Users Say</h2>
              <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
                Join thousands of professionals who have transformed their workflow with ChatGPT 5.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {TESTIMONIALS.map((testimonial, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground text-balance mb-8 max-w-2xl mx-auto">
            Join millions of users who are already experiencing the future of AI conversation.
          </p>
          <Button size="lg" onClick={handleGetStarted} className="text-lg px-8 py-3">
            Start Your First Chat
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-muted/20 px-6 py-8">
          <div className="max-w-6xl mx-auto text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-sm"></div>
              <span className="font-semibold">ChatGPT 5</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 ChatGPT 5. All rights reserved. Built with advanced AI technology.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
