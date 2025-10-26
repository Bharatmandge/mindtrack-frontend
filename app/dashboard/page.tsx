"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { HabitCard } from "@/components/habit-card"
import { MoodTracker } from "@/components/mood-tracker"
import { StreakCalendar } from "@/components/streak-calendar"
import { AddHabitModal } from "@/components/add-habit-modal"
import { AISuggestions } from "@/components/ai-suggestions"
import { SocialShare } from "@/components/social-share"
import { Plus, TrendingUp } from "lucide-react"

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

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [habits, setHabits] = useState<Habit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

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
      if (!response.ok) {
        throw new Error(`Failed to load habits: ${response.status}`)
      }
      const data = await response.json()
      setHabits(data.habits || [])
    } catch (err) {
      console.error("Failed to load habits:", err)
    } finally {
      setIsLoading(false)
    }
  }

 const handleCompleteHabit = async (habitId: string) => {
  if (!user?.id) return

  const today = new Date().toISOString().split("T")[0]
  const habit = habits.find((h) => h.id === habitId)
  if (!habit || habit.lastCompleted === today) return

  // Optimistic update
  setHabits(habits.map(h =>
    h.id === habitId
      ? { ...h, completed: true, streak: h.streak + 1, lastCompleted: today }
      : h
  ))

  // Fire-and-forget fetch (no alert/error handling)
  fetch(`/api/habits/${habitId}/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: user.id, date: today })
  }).catch(err => console.log("Server update failed, ignoring:", err))
}

  const handleAddHabit = async (habitData: { name: string; category: string }) => {
    try {
      const response = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          ...habitData,
        }),
      })

      if (response.ok) {
        const newHabit = await response.json()
        setHabits([...habits, newHabit.habit])
        setShowAddModal(false)
      } else {
        throw new Error(`Failed to add habit: ${response.status}`)
      }
    } catch (err) {
      console.error("Failed to add habit:", err)
      alert("Failed to add habit. Please try again.")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const bestStreak = Math.max(...habits.map((h) => h.streak), 0)
  const completionRate =
    habits.length > 0 ? Math.round((habits.filter((h) => h.completed).length / habits.length) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <Navbar user={user} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.email.split("@")[0]}</h1>
            <p className="text-muted-foreground mt-2">Track your daily habits and wellness goals</p>
          </div>
          <Button className="gap-2" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4" />
            Add Habit
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Today's Completion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {habits.filter((h) => h.completed).length}/{habits.length}
              </div>
              <p className="text-xs text-muted-foreground mt-2">habits completed</p>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Best Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">{bestStreak}</div>
              <p className="text-xs text-muted-foreground mt-2">days in a row</p>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Habits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{habits.length}</div>
              <p className="text-xs text-muted-foreground mt-2">active habits</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Habits */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle>Today's Habits</CardTitle>
                <CardDescription>Complete your daily wellness routine</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {habits.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No habits yet. Create one to get started!</p>
                  ) : (
                    habits.map((habit) => (
                      <HabitCard key={habit.id} habit={habit} onComplete={() => handleCompleteHabit(habit.id)} />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Streak Calendar */}
            <StreakCalendar />
          </div>

          {/* Right Column - Mood, AI Suggestions & Social */}
          <div className="space-y-6">
            <MoodTracker userId={user?.id} />

            <AISuggestions userId={user?.id} existingHabits={habits.map((h) => h.name)} onAddHabit={handleAddHabit} />

            <SocialShare
              userName={user?.email.split("@")[0] || "User"}
              streak={bestStreak}
              completionRate={completionRate}
            />

            {/* Quick Insights */}
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <p className="text-sm font-medium text-foreground">Keep it up!</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {habits.length > 0 ? `You're on a ${bestStreak}-day streak` : "Start tracking to build streaks"}
                  </p>
                </div>
                <div className="p-3 bg-secondary/5 rounded-lg border border-secondary/10">
                  <p className="text-sm font-medium text-foreground">Consistency matters</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Complete habits at the same time each day for better results
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <AddHabitModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleAddHabit} />
    </div>
  )
}