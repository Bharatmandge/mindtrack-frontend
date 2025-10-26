"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { StreakCalendar } from "@/components/streak-calendar"
import { Calendar, Flame } from "lucide-react"

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

export default function CalendarPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [habits, setHabits] = useState<Habit[]>([])
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null)
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
      if (data.habits && data.habits.length > 0) {
        setSelectedHabitId(data.habits[0].id)
      }
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

  const selectedHabit = habits.find((h) => h.id === selectedHabitId)
  const bestStreak = Math.max(...habits.map((h) => h.streak), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <Navbar user={user} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="w-8 h-8 text-primary" />
            Calendar & Streaks
          </h1>
          <p className="text-muted-foreground mt-2">View your habit completion history and track your streaks</p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Best Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary flex items-center gap-2">
                <Flame className="w-6 h-6" />
                {bestStreak}
              </div>
              <p className="text-xs text-muted-foreground mt-2">days in a row</p>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Habits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">{habits.length}</div>
              <p className="text-xs text-muted-foreground mt-2">active habits</p>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">
                {habits.length > 0 ? Math.round((habits.filter((h) => h.completed).length / habits.length) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground mt-2">today's progress</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Habit Selector */}
          <div className="lg:col-span-1">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base">Your Habits</CardTitle>
                <CardDescription>Select a habit to view details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {habits.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No habits yet</p>
                  ) : (
                    habits.map((habit) => (
                      <Button
                        key={habit.id}
                        variant={selectedHabitId === habit.id ? "default" : "outline"}
                        className="w-full justify-start text-left"
                        onClick={() => setSelectedHabitId(habit.id)}
                      >
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-sm">{habit.name}</span>
                          <span className="text-xs opacity-70">🔥 {habit.streak} days</span>
                        </div>
                      </Button>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Calendar View */}
          <div className="lg:col-span-3">
            {selectedHabit ? (
              <div className="space-y-6">
                <Card className="border-border/60">
                  <CardHeader>
                    <CardTitle>{selectedHabit.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <Flame className="w-4 h-4 text-accent" />
                      Current streak: {selectedHabit.streak} days
                    </CardDescription>
                  </CardHeader>
                </Card>

                <StreakCalendar userId={user?.id} habitId={selectedHabitId} />
              </div>
            ) : (
              <Card className="border-border/60">
                <CardContent className="py-12">
                  <p className="text-center text-muted-foreground">Create a habit to get started</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
