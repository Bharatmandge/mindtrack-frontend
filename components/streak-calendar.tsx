"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"

interface StreakCalendarProps {
  userId?: string
  habitId?: string
}

export function StreakCalendar({ userId, habitId }: StreakCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [completionData, setCompletionData] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (userId) {
      loadCompletionData()
    }
  }, [userId, currentDate])

  const loadCompletionData = async () => {
    if (!userId) return
    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/habits/completion?userId=${userId}&month=${currentDate.getMonth() + 1}&year=${currentDate.getFullYear()}${habitId ? `&habitId=${habitId}` : ""}`,
      )
      const data = await response.json()
      setCompletionData(data.completionData || {})
    } catch (err) {
      console.error("Failed to load completion data:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i)

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const isCompleted = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return completionData[dateStr] || false
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Streak Calendar</CardTitle>
            <CardDescription>Your habit completion history</CardDescription>
          </div>
          <div className="flex gap-2">
            <button onClick={previousMonth} className="p-1 hover:bg-muted rounded">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={nextMonth} className="p-1 hover:bg-muted rounded">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <h3 className="font-medium text-foreground">
            {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </h3>

          <div className="grid grid-cols-7 gap-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}

            {emptyDays.map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {days.map((day) => (
              <div
                key={day}
                className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  isCompleted(day) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
                title={isCompleted(day) ? "Completed" : "Not completed"}
              >
                {day}
              </div>
            ))}
          </div>

          <div className="flex gap-4 text-xs mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-primary" />
              <span className="text-muted-foreground">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-muted" />
              <span className="text-muted-foreground">Not completed</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
