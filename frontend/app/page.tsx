"use client"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, MessageSquare, Users, Zap, Shield, Star, Menu, X } from "lucide-react"
import { Logo } from "@/components/logo"
import { useAuth } from "@/hooks/useAuth"

const PLACEHOLDER_FEATURES = [
  {
    icon: MessageSquare,
    title: "Intelligent Conversations",
    description: "Engage in natural, context-aware conversations with advanced AI",
  },
  {
    icon: Users,
    title: "Collaborative Learning",
    description: "Share and learn together with our community-driven platform",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Get instant responses and real-time assistance",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your conversations are encrypted and completely private",
  },
]

const PLACEHOLDER_TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "Student",
    content: "This AI study buddy has transformed how I learn. It's like having a personal tutor available 24/7.",
    rating: 5,
  },
  {
    name: "Mike Rodriguez",
    role: "Developer",
    content:
      "The code assistance and explanations are incredibly helpful. It's become an essential part of my workflow.",
    rating: 5,
  },
  {
    name: "Emily Johnson",
    role: "Researcher",
    content: "Perfect for breaking down complex topics and getting quick answers to research questions.",
    rating: 5,
  },
]

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const { isAuthenticated, logout } = useAuth()

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push("/chat")
    } else {
      router.push("/login")
    }
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Logo size="md" />
              <span className="text-xl font-bold">Shape AI</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">
                Testimonials
              </a>
              <Button onClick={handleGetStarted} className="bg-primary text-primary-foreground hover:bg-primary/90">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Mobile menu button */}
            <Button variant="ghost" size="sm" className="md:hidden h-8 w-8 p-0" onClick={toggleMobileMenu}>
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-border py-4">
              <div className="flex flex-col space-y-4">
                <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </a>
                <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">
                  Testimonials
                </a>
                <Button
                  onClick={handleGetStarted}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 w-full"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance mb-6">
            Your AI-Powered
            <span className="text-primary"> Study Companion</span>
          </h1>
          <p className="text-xl text-muted-foreground text-pretty mb-8 max-w-2xl mx-auto">
            Get instant help with homework, coding problems, research, and more. Our advanced AI understands context and
            provides personalized assistance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-3"
            >
              Start Chatting Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3 bg-transparent">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why Choose Shape AI?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover the features that make learning easier and more effective
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {PLACEHOLDER_FEATURES.map((feature, index) => (
              <div
                key={index}
                className="bg-background p-6 rounded-lg border border-border hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-xl text-muted-foreground">Join thousands of satisfied learners</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {PLACEHOLDER_TESTIMONIALS.map((testimonial, index) => (
              <div key={index} className="bg-muted/50 p-6 rounded-lg border border-border">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Transform Your Learning?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of students and professionals who are already using Shape AI
          </p>
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-3"
          >
            Get Started for Free
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Logo size="md" />
              <span className="text-xl font-bold">Shape AI</span>
            </div>
            <div className="text-muted-foreground text-center md:text-right">
              <p>&copy; 2024 Shape AI. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
