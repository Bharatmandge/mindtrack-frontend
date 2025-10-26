"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Lightbulb } from "lucide-react"

interface Insight {
  title: string
  description: string
  type: "success" | "warning" | "suggestion"
  priority: number
}

interface InsightsPanelProps {
  userId?: string
}

export function InsightsPanel({ userId }: InsightsPanelProps) {
  const [insights, setInsights] = useState<Insight[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      loadInsights()
    }
  }, [userId])

  const loadInsights = async () => {
    try {
      const response = await fetch(`/api/insights?userId=${userId}`)
      const data = await response.json()
      setInsights(data.insights || [])
    } catch (err) {
      console.error("Failed to load insights:", err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading insights...</div>
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case "suggestion":
        return <Lightbulb className="w-5 h-5 text-blue-500" />
      default:
        return null
    }
  }

  const getBgColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200"
      case "warning":
        return "bg-yellow-50 border-yellow-200"
      case "suggestion":
        return "bg-blue-50 border-blue-200"
      default:
        return "bg-muted border-border"
    }
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle>Personalized Insights</CardTitle>
        <CardDescription>AI-powered recommendations for your wellness journey</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No insights available yet</p>
        ) : (
          insights.map((insight, idx) => (
            <div key={idx} className={`p-4 rounded-lg border flex gap-3 ${getBgColor(insight.type)}`}>
              <div className="flex-shrink-0 mt-0.5">{getIcon(insight.type)}</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{insight.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
