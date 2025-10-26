"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface MoodTrackerProps {
  userId?: string
}

const moods = [
  { emoji: "😢", label: "Sad", value: 1 },
  { emoji: "😐", label: "Okay", value: 2 },
  { emoji: "🙂", label: "Good", value: 3 },
  { emoji: "😊", label: "Great", value: 4 },
  { emoji: "🤩", label: "Amazing", value: 5 },
]

export function MoodTracker({ userId }: MoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [todayMood, setTodayMood] = useState<number | null>(null)

  useEffect(() => {
    if (userId) {
      loadTodayMood()
    }
  }, [userId])

  const loadTodayMood = async () => {
    try {
      const today = new Date().toISOString().split("T")[0]
      const response = await fetch(`/api/moods?userId=${userId}`)
      const data = await response.json()
      const todayEntry = data.moods?.find((m: any) => m.date === today)
      if (todayEntry) {
        setTodayMood(todayEntry.mood)
        setSelectedMood(todayEntry.mood)
      }
    } catch (err) {
      console.error("Failed to load today's mood:", err)
    }
  }

  const handleMoodSelect = async (moodValue: number) => {
    setSelectedMood(moodValue)

    try {
      const today = new Date().toISOString().split("T")[0]
      await fetch("/api/moods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, mood: moodValue, date: today }),
      })
      setTodayMood(moodValue)
      setIsSubmitted(true)
      setTimeout(() => setIsSubmitted(false), 2000)
    } catch (err) {
      console.error("Failed to save mood:", err)
    }
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle>How are you feeling?</CardTitle>
        <CardDescription>Track your daily mood</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between gap-2">
            {moods.map((mood) => (
              <button
                key={mood.value}
                onClick={() => handleMoodSelect(mood.value)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                  selectedMood === mood.value ? "bg-primary/20 scale-110" : "hover:bg-muted"
                }`}
                title={mood.label}
              >
                <span className="text-2xl">{mood.emoji}</span>
                <span className="text-xs text-muted-foreground">{mood.label}</span>
              </button>
            ))}
          </div>

          {isSubmitted && <p className="text-sm text-primary text-center">Mood saved!</p>}
          {todayMood && !isSubmitted && (
            <p className="text-xs text-muted-foreground text-center">
              Today's mood: {moods.find((m) => m.value === todayMood)?.label}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
