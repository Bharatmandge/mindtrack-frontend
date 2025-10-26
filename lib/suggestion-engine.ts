import { dataStore } from "./data-store"

interface Suggestion {
  name: string
  category: string
  reason: string
  difficulty: "easy" | "medium" | "hard"
  timeCommitment: string
}

const habitDatabase: Suggestion[] = [
  {
    name: "Morning Meditation",
    category: "meditation",
    reason: "Starts your day with mindfulness and clarity",
    difficulty: "easy",
    timeCommitment: "5-10 min",
  },
  {
    name: "Gratitude Journaling",
    category: "journaling",
    reason: "Increases positivity and self-awareness",
    difficulty: "easy",
    timeCommitment: "5-10 min",
  },
  {
    name: "Stretching Routine",
    category: "stretching",
    reason: "Improves flexibility and reduces muscle tension",
    difficulty: "easy",
    timeCommitment: "10-15 min",
  },
  {
    name: "Evening Reflection",
    category: "meditation",
    reason: "Helps process the day and prepare for sleep",
    difficulty: "easy",
    timeCommitment: "5-10 min",
  },
  {
    name: "Cold Water Shower",
    category: "exercise",
    reason: "Boosts energy, resilience, and circulation",
    difficulty: "hard",
    timeCommitment: "5 min",
  },
  {
    name: "Breathing Exercises",
    category: "meditation",
    reason: "Reduces stress, anxiety, and improves focus",
    difficulty: "easy",
    timeCommitment: "5 min",
  },
  {
    name: "Reading",
    category: "reading",
    reason: "Expands knowledge and improves focus",
    difficulty: "easy",
    timeCommitment: "20-30 min",
  },
  {
    name: "Yoga Session",
    category: "exercise",
    reason: "Combines strength, flexibility, and mindfulness",
    difficulty: "medium",
    timeCommitment: "20-30 min",
  },
  {
    name: "Meal Prep",
    category: "nutrition",
    reason: "Supports healthy eating habits",
    difficulty: "medium",
    timeCommitment: "30-45 min",
  },
  {
    name: "Walk in Nature",
    category: "exercise",
    reason: "Combines exercise with mental health benefits",
    difficulty: "easy",
    timeCommitment: "20-30 min",
  },
  {
    name: "Creative Writing",
    category: "journaling",
    reason: "Enhances creativity and emotional expression",
    difficulty: "medium",
    timeCommitment: "15-20 min",
  },
  {
    name: "Hydration Tracking",
    category: "water",
    reason: "Ensures proper hydration for health",
    difficulty: "easy",
    timeCommitment: "1 min",
  },
  {
    name: "Sleep Hygiene",
    category: "sleep",
    reason: "Improves sleep quality and recovery",
    difficulty: "easy",
    timeCommitment: "varies",
  },
  {
    name: "Strength Training",
    category: "exercise",
    reason: "Builds muscle and improves overall fitness",
    difficulty: "hard",
    timeCommitment: "30-45 min",
  },
  {
    name: "Mindful Eating",
    category: "nutrition",
    reason: "Improves digestion and food awareness",
    difficulty: "medium",
    timeCommitment: "varies",
  },
]

export class SuggestionEngine {
  generateSuggestions(userId: string, existingHabits: string[], limit = 3): Suggestion[] {
    const userHabits = dataStore.getHabits(userId)
    const userMoods = dataStore.getMoods(userId)

    // Get user's existing categories
    const existingCategories = new Set(userHabits.map((h) => h.category))

    // Filter out habits that already exist
    const availableSuggestions = habitDatabase.filter(
      (s) => !existingHabits.some((h) => h.toLowerCase() === s.name.toLowerCase()),
    )

    // Score suggestions based on user profile
    const scoredSuggestions = availableSuggestions.map((suggestion) => {
      let score = 0

      // Prefer habits from underrepresented categories
      if (!existingCategories.has(suggestion.category)) {
        score += 10
      }

      // Prefer easy habits if user has low completion rate
      const avgCompletion =
        userHabits.length > 0
          ? userHabits.reduce((sum, h) => sum + dataStore.getHabitStats(userId, h.id, 7).completionRate, 0) /
            userHabits.length
          : 50

      if (avgCompletion < 50 && suggestion.difficulty === "easy") {
        score += 5
      }

      // Prefer meditation if mood is low
      if (userMoods.length > 0) {
        const recentMoods = userMoods.slice(-3)
        const avgMood = recentMoods.reduce((sum, m) => sum + m.mood, 0) / recentMoods.length
        if (avgMood < 3 && suggestion.category === "meditation") {
          score += 8
        }
      }

      // Prefer exercise if user has no exercise habits
      if (!existingCategories.has("exercise") && suggestion.category === "exercise") {
        score += 7
      }

      return { ...suggestion, score }
    })

    // Sort by score and return top suggestions
    return scoredSuggestions.sort((a, b) => b.score - a.score).slice(0, limit)
  }

  getHabitTips(habitName: string): string[] {
    const tips: Record<string, string[]> = {
      meditation: [
        "Start with just 5 minutes and gradually increase",
        "Find a quiet, comfortable space",
        "Try different meditation styles to find what works",
        "Practice at the same time each day",
      ],
      exercise: [
        "Start with low intensity and build up gradually",
        "Find an activity you enjoy",
        "Exercise with a friend for accountability",
        "Schedule it like any other appointment",
      ],
      journaling: [
        "Write without judging your thoughts",
        "Set a specific time each day",
        "Use prompts if you're stuck",
        "Reflect on your entries weekly",
      ],
      reading: [
        "Choose books that interest you",
        "Set a daily reading goal",
        "Create a comfortable reading space",
        "Join a book club for motivation",
      ],
      nutrition: [
        "Plan meals ahead of time",
        "Start with small dietary changes",
        "Focus on whole foods",
        "Stay hydrated throughout the day",
      ],
    }

    const category = Object.keys(tips).find((key) => habitName.toLowerCase().includes(key))
    return tips[category] || ["Be consistent", "Start small", "Track your progress", "Celebrate wins"]
  }
}

export const suggestionEngine = new SuggestionEngine()
