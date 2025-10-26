"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface AnalyticsDashboardProps {
  habits: Array<{
    id: string
    name: string
    category: string
    completed: boolean
    streak: number
    lastCompleted: string
  }>
}

export function AnalyticsDashboard({ habits }: AnalyticsDashboardProps) {
  const [chartData, setChartData] = useState<Array<{ name: string; completion: number }>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const generateChartData = async () => {
      try {
        const completionPromises = habits.map((habit) =>
          fetch(`/api/habits/${habit.id}/stats`).then((res) => res.json()),
        )

        const completionStats = await Promise.all(completionPromises)

        // Group by category and calculate average completion rate
        const categoryMap = new Map<string, { total: number; completionRate: number; count: number }>()

        habits.forEach((habit, index) => {
          const stats = completionStats[index]
          const completionRate = stats.completionRate || 0
          const categoryName = habit.category.charAt(0).toUpperCase() + habit.category.slice(1)

          if (!categoryMap.has(categoryName)) {
            categoryMap.set(categoryName, { total: 0, completionRate: 0, count: 0 })
          }

          const existing = categoryMap.get(categoryName)!
          existing.completionRate += completionRate
          existing.count += 1
        })

        // Calculate average completion rate per category
        const data = Array.from(categoryMap.entries()).map(([category, stats]) => ({
          name: category,
          completion: Math.round(stats.completionRate / stats.count),
        }))

        setChartData(data)
      } catch (err) {
        console.error("Failed to load completion stats:", err)
        // Fallback: show all categories with 0% if API fails
        const categoryMap = new Map<string, number>()
        habits.forEach((habit) => {
          const categoryName = habit.category.charAt(0).toUpperCase() + habit.category.slice(1)
          if (!categoryMap.has(categoryName)) {
            categoryMap.set(categoryName, 0)
          }
        })
        const data = Array.from(categoryMap.entries()).map(([category, completion]) => ({
          name: category,
          completion,
        }))
        setChartData(data)
      } finally {
        setIsLoading(false)
      }
    }

    if (habits.length > 0) {
      generateChartData()
    } else {
      setIsLoading(false)
    }
  }, [habits])

  const weeklyData = [
    { day: "Mon", completed: 3 },
    { day: "Tue", completed: 4 },
    { day: "Wed", completed: 2 },
    { day: "Thu", completed: 5 },
    { day: "Fri", completed: 4 },
    { day: "Sat", completed: 3 },
    { day: "Sun", completed: 6 },
  ]

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading analytics...</div>
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Completion Rate by Category</CardTitle>
          <CardDescription>Your habit completion percentage</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No habits yet. Create a habit to see analytics.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  domain={[0, 100]}
                  label={{ value: "Percentage (%)", angle: -90, position: "insideLeft" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: `1px solid var(--color-border)`,
                    borderRadius: "8px",
                  }}
                  formatter={(value) => `${value}%`}
                />
                <Bar dataKey="completion" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Weekly Habit Completion</CardTitle>
          <CardDescription>Habits completed per day this week</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="day" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: `1px solid var(--color-border)`,
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="var(--color-secondary)"
                strokeWidth={2}
                dot={{ fill: "var(--color-secondary)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
