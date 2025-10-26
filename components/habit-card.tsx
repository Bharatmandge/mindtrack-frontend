"use client"

import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Circle } from "lucide-react"

interface HabitCardProps {
  habit: {
    id: string
    name: string
    category: string
    completed: boolean
    streak: number
    lastCompleted: string
  }
  onComplete: () => void
}

export function HabitCard({ habit, onComplete }: HabitCardProps) {
  const categoryColors: Record<string, string> = {
    exercise: "bg-accent/10 text-accent",
    meditation: "bg-primary/10 text-primary",
    reading: "bg-secondary/10 text-secondary",
    water: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    sleep: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  }

  const categoryColor = categoryColors[habit.category] || "bg-muted text-muted-foreground"
  const isCompletedToday = habit.lastCompleted === new Date().toISOString().split("T")[0]

  return (
    <Card className="border-border/60 hover:border-border/80 transition-colors">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={onComplete}
            disabled={isCompletedToday}
            className="flex-shrink-0 transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCompletedToday ? (
              <CheckCircle2 className="w-6 h-6 text-primary" />
            ) : (
              <Circle className="w-6 h-6 text-muted-foreground" />
            )}
          </button>

          <div className="flex-1">
            <h3
              className={`font-medium ${isCompletedToday ? "line-through text-muted-foreground" : "text-foreground"}`}
            >
              {habit.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-1 rounded-full ${categoryColor}`}>{habit.category}</span>
              <span className="text-xs text-muted-foreground">🔥 {habit.streak} day streak</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs text-muted-foreground">{isCompletedToday ? "Today" : "Not today"}</p>
        </div>
      </CardContent>
    </Card>
  )
}
