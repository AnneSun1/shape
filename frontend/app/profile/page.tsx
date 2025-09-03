"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Crown } from "lucide-react"
import { useRouter } from "next/navigation"

const PLACEHOLDER_USER = {
  id: "user-1",
  name: "Bob Jones",
  email: "bob.jones@example.com",
  initials: "BJ",
  plan: "Plus",
  joinDate: "January 2024",
  totalChats: 127,
  favoriteTopics: ["AI", "Programming", "Data Science", "Machine Learning"],
}

export default function ProfilePage() {
  const router = useRouter()

  const handleBackClick = () => {
    router.push("/chat")
  }

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("user")
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={handleBackClick} className="h-8 w-8 p-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl font-semibold">Profile Settings</h1>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Profile Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-xl font-medium text-white">{PLACEHOLDER_USER.initials}</span>
                </div>
                <div>
                  <CardTitle className="text-2xl">{PLACEHOLDER_USER.name}</CardTitle>
                  <CardDescription className="flex items-center space-x-2">
                    <Crown className="w-4 h-4" />
                    <span>{PLACEHOLDER_USER.plan} Plan</span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Manage your account details and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue={PLACEHOLDER_USER.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={PLACEHOLDER_USER.email} />
                </div>
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>

          {/* Usage Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Statistics</CardTitle>
              <CardDescription>Your ChatGPT activity overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{PLACEHOLDER_USER.totalChats}</div>
                  <div className="text-sm text-muted-foreground">Total Conversations</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{PLACEHOLDER_USER.joinDate}</div>
                  <div className="text-sm text-muted-foreground">Member Since</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{PLACEHOLDER_USER.plan}</div>
                  <div className="text-sm text-muted-foreground">Current Plan</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Favorite Topics */}
          <Card>
            <CardHeader>
              <CardTitle>Favorite Topics</CardTitle>
              <CardDescription>Topics you discuss most frequently</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {PLACEHOLDER_USER.favoriteTopics.map((topic, index) => (
                  <span key={index} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    {topic}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>Manage your account session</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={handleLogout} className="w-full">
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
