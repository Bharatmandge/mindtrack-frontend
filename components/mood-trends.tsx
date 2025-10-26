"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface MoodTrendsProps {
  userId?: string
}

export function MoodTrends({ userId }: MoodTrendsProps) {
  const [moodData, setMoodData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      loadMoodTrends()
    }
  }, [userId])

  const loadMoodTrends = async () => {
    try {
      const response = await fetch(`/api/moods?userId=${userId}`)
      const data = await response.json()

      const moods = data.moods || []
      const last7Days = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split("T")[0]
        const dayName = date.toLocaleDateString("en-US", { weekday: "short" })
        const moodEntry = moods.find((m: any) => m.date === dateStr)
        last7Days.push({
          date: dayName,
          mood: moodEntry?.mood || 0,
          fullDate: dateStr,
        })
      }

      setMoodData(last7Days)
    } catch (err) {
      console.error("Failed to load mood trends:", err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading mood trends...</div>
  }

  const averageMood =
    moodData.length > 0 ? Math.round((moodData.reduce((sum, d) => sum + d.mood, 0) / moodData.length) * 10) / 10 : 0

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle>Mood Trends</CardTitle>
        <CardDescription>Your mood over the last 7 days (Average: {averageMood}/5)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={moodData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="date" stroke="var(--color-muted-foreground)" />
            <YAxis domain={[0, 5]} stroke="var(--color-muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-card)",
                border: `1px solid var(--color-border)`,
                borderRadius: "8px",
              }}
              formatter={(value) => {
                const moodLabels = ["No data", "Sad", "Okay", "Good", "Great", "Amazing"]
                return moodLabels[value] || "No data"
              }}
            />
            <Line
              type="monotone"
              dataKey="mood"
              stroke="var(--color-accent)"
              strokeWidth={2}
              dot={{ fill: "var(--color-accent)", r: 4 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
