"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft, MessageSquare } from "lucide-react"
import { Logo } from "@/components/logo"

export default function NotFound() {
  const router = useRouter()

  const handleGoHome = () => {
    router.push("/")
  }

  const handleGoBack = () => {
    router.back()
  }

  const handleStartChat = () => {
    router.push("/chat")
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Logo size="md" />
              <span className="text-xl font-bold">Shape AI</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="text-8xl font-bold text-muted-foreground/20 mb-4">404</div>
            <div className="w-24 h-24 mx-auto mb-6 bg-muted/30 rounded-full flex items-center justify-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground" />
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
          <p className="text-muted-foreground mb-8 text-lg">
            Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong
            URL.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleGoHome} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
            <Button onClick={handleGoBack} variant="outline" className="bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button onClick={handleStartChat} variant="secondary">
              <MessageSquare className="w-4 h-4 mr-2" />
              Start Chat
            </Button>
          </div>

          {/* Help Text */}
          <div className="mt-12 text-sm text-muted-foreground">
            <p>Need help? Try these popular pages:</p>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              <button onClick={handleGoHome} className="text-primary hover:underline">
                Home
              </button>
              <button onClick={handleStartChat} className="text-primary hover:underline">
                Chat
              </button>
              <button onClick={() => router.push("/login")} className="text-primary hover:underline">
                Login
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Logo size="sm" />
            <span className="text-lg font-semibold">Shape AI</span>
          </div>
          <p className="text-muted-foreground text-sm">&copy; 2024 Shape AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
