"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface CategoryBreakdownProps {
  userId?: string
}

export function CategoryBreakdown({ userId }: CategoryBreakdownProps) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      loadCategoryData()
    }
  }, [userId])

  const loadCategoryData = async () => {
    try {
      const response = await fetch(`/api/analytics?userId=${userId}`)
      const result = await response.json()
      const categoryStats = result.categoryStats || {}

      const chartData = Object.entries(categoryStats).map(([category, stats]: [string, any]) => ({
        name: category.charAt(0).toUpperCase() + category.slice(1),
        value: stats.count,
        rate: stats.completionRate,
      }))

      setData(chartData)
    } catch (err) {
      console.error("Failed to load category data:", err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading category data...</div>
  }

  const COLORS = ["var(--color-primary)", "var(--color-secondary)", "var(--color-accent)", "#8b5cf6"]

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle>Habit Categories</CardTitle>
        <CardDescription>Distribution of your habits by category</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No habits yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} (${value})`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} habits`} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
