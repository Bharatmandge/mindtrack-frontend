import { dataStore } from "./data-store"

interface Insight {
  title: string
  description: string
  type: "success" | "warning" | "suggestion"
  priority: number
}

export class InsightsEngine {
  generateInsights(userId: string): Insight[] {
    const habits = dataStore.getHabits(userId)
    const moods = dataStore.getMoods(userId)
    const insights: Insight[] = []

    if (habits.length === 0) {
      return [
        {
          title: "Get Started",
          description: "Create your first habit to begin tracking your wellness journey.",
          type: "suggestion",
          priority: 1,
        },
      ]
    }

    // Analyze streaks
    const bestStreak = Math.max(...habits.map((h) => h.streak), 0)
    const bestHabit = habits.find((h) => h.streak === bestStreak)

    if (bestStreak > 0) {
      insights.push({
        title: "Great Consistency",
        description: `Your "${bestHabit?.name}" habit has a ${bestStreak}-day streak. Keep the momentum going!`,
        type: "success",
        priority: 1,
      })
    }

    // Analyze completion rates
    const completionRates = habits.map((habit) => {
      const stats = dataStore.getHabitStats(userId, habit.id, 7)
      return { habit, rate: stats.completionRate }
    })

    const lowPerformers = completionRates.filter((h) => h.rate < 50)
    if (lowPerformers.length > 0) {
      const habitNames = lowPerformers.map((h) => h.habit.name).join(", ")
      insights.push({
        title: "Habits Need Attention",
        description: `${habitNames} have low completion rates. Consider adjusting the time or difficulty.`,
        type: "warning",
        priority: 2,
      })
    }

    // Analyze mood correlation
    if (moods.length >= 3) {
      const recentMoods = moods.slice(-7)
      const avgMood = recentMoods.reduce((sum, m) => sum + m.mood, 0) / recentMoods.length
      if (avgMood >= 4) {
        insights.push({
          title: "Positive Mood Trend",
          description: "Your mood has been consistently positive. Your habits are contributing to your wellness!",
          type: "success",
          priority: 1,
        })
      } else if (avgMood < 2.5) {
        insights.push({
          title: "Mood Support",
          description: "Consider adding meditation or journaling to help improve your mood.",
          type: "suggestion",
          priority: 2,
        })
      }
    }

    // Suggest new habits
    const categories = new Set(habits.map((h) => h.category))
    if (categories.size < 4) {
      const suggestions = [
        { name: "Meditation", category: "meditation" },
        { name: "Journaling", category: "journaling" },
        { name: "Reading", category: "reading" },
        { name: "Exercise", category: "exercise" },
      ]
      const missingCategory = suggestions.find((s) => !categories.has(s.category))
      if (missingCategory) {
        insights.push({
          title: "Diversify Your Habits",
          description: `Try adding a ${missingCategory.category} habit to create a more balanced wellness routine.`,
          type: "suggestion",
          priority: 3,
        })
      }
    }

    return insights.sort((a, b) => a.priority - b.priority)
  }

  getWeeklyTrend(userId: string, habitId: string): { day: string; completed: boolean }[] {
    const completions = dataStore.getCompletions(userId, habitId)
    const trend = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" })
      const completed = completions.some((c) => c.date === dateStr)
      trend.push({ day: dayName, completed })
    }

    return trend
  }

  getCategoryBreakdown(userId: string): Record<string, { total: number; completed: number; rate: number }> {
    const habits = dataStore.getHabits(userId)
    const breakdown: Record<string, { total: number; completed: number; rate: number }> = {}

    habits.forEach((habit) => {
      if (!breakdown[habit.category]) {
        breakdown[habit.category] = { total: 0, completed: 0, rate: 0 }
      }
      breakdown[habit.category].total += 1

      const stats = dataStore.getHabitStats(userId, habit.id, 7)
      breakdown[habit.category].completed += stats.completedDays
      breakdown[habit.category].rate = Math.round(
        (breakdown[habit.category].completed / (breakdown[habit.category].total * 7)) * 100,
      )
    })

    return breakdown
  }
}

export const insightsEngine = new InsightsEngine()
