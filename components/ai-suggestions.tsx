"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Plus, Info } from "lucide-react"

interface AISuggestionsProps {
  userId?: string
  existingHabits: string[]
  onAddHabit?: (habit: { name: string; category: string }) => void
}

interface Suggestion {
  name: string
  category: string
  reason: string
  difficulty: "easy" | "medium" | "hard"
  timeCommitment: string
}

export function AISuggestions({ userId, existingHabits, onAddHabit }: AISuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [expandedTip, setExpandedTip] = useState<string | null>(null)
  const [tips, setTips] = useState<Record<string, string[]>>({})

  useEffect(() => {
    generateSuggestions()
  }, [existingHabits])

  const generateSuggestions = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/ai/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          existingHabits,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.suggestions || [])
      }
    } catch (err) {
      console.error("Failed to get suggestions:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadTips = async (habitName: string) => {
    if (tips[habitName]) {
      setExpandedTip(expandedTip === habitName ? null : habitName)
      return
    }

    try {
      const response = await fetch(`/api/ai/tips?habit=${encodeURIComponent(habitName)}`)
      if (response.ok) {
        const data = await response.json()
        setTips((prev) => ({ ...prev, [habitName]: data.tips }))
        setExpandedTip(habitName)
      }
    } catch (err) {
      console.error("Failed to load tips:", err)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          AI Habit Suggestions
        </CardTitle>
        <CardDescription>Personalized recommendations based on your routine</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-4">Generating suggestions...</p>
        ) : suggestions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No suggestions available yet</p>
        ) : (
          suggestions.map((suggestion) => (
            <div key={suggestion.name} className="space-y-2">
              <div className="p-3 bg-accent/5 rounded-lg border border-accent/10 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{suggestion.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{suggestion.reason}</p>
                    <div className="flex gap-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(suggestion.difficulty)}`}>
                        {suggestion.difficulty}
                      </span>
                      <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                        {suggestion.timeCommitment}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => loadTips(suggestion.name)}
                      title="Get tips"
                      className="h-8 w-8 p-0"
                    >
                      <Info className="w-4 h-4" />
                    </Button>
                    {onAddHabit && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          onAddHabit({
                            name: suggestion.name,
                            category: suggestion.category,
                          })
                        }
                        title="Add habit"
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {expandedTip === suggestion.name && tips[suggestion.name] && (
                <div className="ml-3 p-3 bg-blue-50 rounded-lg border border-blue-200 space-y-2">
                  <p className="text-xs font-medium text-blue-900">Tips for success:</p>
                  <ul className="text-xs text-blue-800 space-y-1">
                    {tips[suggestion.name].map((tip, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-blue-600">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
