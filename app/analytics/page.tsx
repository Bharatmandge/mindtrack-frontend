"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { MoodTrends } from "@/components/mood-trends"
import { CategoryBreakdown } from "@/components/category-breakdown"
import { InsightsPanel } from "@/components/insights-panel"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingUp } from "lucide-react"

interface Habit {
  id: string
  name: string
  category: string
  completed: boolean
  streak: number
  lastCompleted: string
}

interface User {
  id: string
  email: string
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [habits, setHabits] = useState<Habit[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/")
      return
    }

    const userData = JSON.parse(storedUser)
    setUser(userData)
    loadHabits(userData.id)
  }, [router])

  const loadHabits = async (userId: string) => {
    try {
      const response = await fetch(`/api/habits?userId=${userId}`)
      const data = await response.json()
      setHabits(data.habits || [])
    } catch (err) {
      console.error("Failed to load habits:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const totalHabits = habits.length
  const completedToday = habits.filter((h) => h.completed).length
  const averageStreak = totalHabits > 0 ? Math.round(habits.reduce((sum, h) => sum + h.streak, 0) / totalHabits) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <Navbar user={user} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-primary" />
            Analytics & Insights
          </h1>
          <p className="text-muted-foreground mt-2">Track your progress and identify patterns</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Habits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{totalHabits}</div>
              <p className="text-xs text-muted-foreground mt-2">active habits tracked</p>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Today's Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">
                {totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {completedToday} of {totalHabits} completed
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{averageStreak}</div>
              <p className="text-xs text-muted-foreground mt-2">days across all habits</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <AnalyticsDashboard habits={habits} />
          </div>
          <CategoryBreakdown userId={user?.id} />
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <MoodTrends userId={user?.id} />
          <InsightsPanel userId={user?.id} />
        </div>

        {/* Recommendations */}
        <Card className="border-border/60 mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Recommendations
            </CardTitle>
            <CardDescription>Personalized suggestions to improve your wellness</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
              <p className="text-sm font-medium text-foreground">Focus on consistency</p>
              <p className="text-xs text-muted-foreground mt-1">
                Your meditation habit has the highest completion rate. Keep it up!
              </p>
            </div>
            <div className="p-3 bg-secondary/5 rounded-lg border border-secondary/10">
              <p className="text-sm font-medium text-foreground">Best time to exercise</p>
              <p className="text-xs text-muted-foreground mt-1">
                You complete workouts 80% more often in the morning. Try scheduling them earlier.
              </p>
            </div>
            <div className="p-3 bg-accent/5 rounded-lg border border-accent/10">
              <p className="text-sm font-medium text-foreground">Build new habits gradually</p>
              <p className="text-xs text-muted-foreground mt-1">
                Start with one new habit at a time to maintain consistency.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
