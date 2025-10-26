// This replaces the scattered in-memory databases in individual API routes

interface User {
  id: string
  email: string
  password: string
  createdAt: string
}

interface Habit {
  id: string
  userId: string
  name: string
  category: string
  streak: number
  lastCompleted: string | null
  createdAt: string
}

interface HabitCompletion {
  id: string
  habitId: string
  userId: string
  date: string
  completed: boolean
}

interface Mood {
  id: string
  userId: string
  mood: string
  date: string
  notes?: string
}

class DataStore {
  private storageKey = "mindtrack_data"

  private getData() {
    if (typeof window === "undefined") {
      return {
        users: {},
        habits: {},
        completions: {},
        moods: {},
      }
    }

    const stored = localStorage.getItem(this.storageKey)
    return stored
      ? JSON.parse(stored)
      : {
          users: {},
          habits: {},
          completions: {},
          moods: {},
        }
  }

  private saveData(data: any) {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.storageKey, JSON.stringify(data))
    }
  }

  // User operations
  createUser(email: string, password: string): User {
    const data = this.getData()
    const userId = `user_${Date.now()}`
    const user: User = {
      id: userId,
      email,
      password,
      createdAt: new Date().toISOString(),
    }
    data.users[userId] = user
    this.saveData(data)
    return user
  }

  getUser(userId: string): User | null {
    const data = this.getData()
    return data.users[userId] || null
  }

  getUserByEmail(email: string): User | null {
    const data = this.getData()
    return Object.values(data.users).find((u: any) => u.email === email) || null
  }

  // Habit operations
  createHabit(userId: string, name: string, category: string): Habit {
    const data = this.getData()
    const habitId = `habit_${Date.now()}`
    const habit: Habit = {
      id: habitId,
      userId,
      name,
      category,
      streak: 0,
      lastCompleted: null,
      createdAt: new Date().toISOString(),
    }
    data.habits[habitId] = habit
    this.saveData(data)
    return habit
  }

  getHabits(userId: string): Habit[] {
    const data = this.getData()
    return Object.values(data.habits).filter((h: any) => h.userId === userId)
  }

  getHabit(habitId: string): Habit | null {
    const data = this.getData()
    return data.habits[habitId] || null
  }

  updateHabit(habitId: string, updates: Partial<Habit>): Habit | null {
    const data = this.getData()
    if (!data.habits[habitId]) return null
    data.habits[habitId] = { ...data.habits[habitId], ...updates }
    this.saveData(data)
    return data.habits[habitId]
  }

  deleteHabit(habitId: string): boolean {
    const data = this.getData()
    if (!data.habits[habitId]) return false
    delete data.habits[habitId]
    this.saveData(data)
    return true
  }

  // Habit completion operations
  completeHabit(
    habitId: string,
    userId: string,
    date: string = new Date().toISOString().split("T")[0],
  ): HabitCompletion {
    const data = this.getData()
    const completionId = `completion_${Date.now()}`
    const completion: HabitCompletion = {
      id: completionId,
      habitId,
      userId,
      date,
      completed: true,
    }
    data.completions[completionId] = completion

    // Update habit streak
    const habit = data.habits[habitId]
    if (habit) {
      const lastCompleted = habit.lastCompleted
      const today = date
      if (lastCompleted !== today) {
        const lastDate = lastCompleted ? new Date(lastCompleted) : null
        const todayDate = new Date(today)
        const yesterday = new Date(todayDate)
        yesterday.setDate(yesterday.getDate() - 1)

        if (lastDate && lastDate.toISOString().split("T")[0] === yesterday.toISOString().split("T")[0]) {
          habit.streak += 1
        } else if (!lastDate) {
          habit.streak = 1
        } else {
          habit.streak = 1
        }
        habit.lastCompleted = today
      }
    }

    this.saveData(data)
    return completion
  }

  getCompletions(userId: string, habitId?: string): HabitCompletion[] {
    const data = this.getData()
    return Object.values(data.completions).filter((c: any) => {
      if (habitId) return c.userId === userId && c.habitId === habitId
      return c.userId === userId
    })
  }

  getCompletionsByDate(userId: string, date: string): HabitCompletion[] {
    const data = this.getData()
    return Object.values(data.completions).filter((c: any) => c.userId === userId && c.date === date)
  }

  // Mood operations
  saveMood(userId: string, mood: string, date: string = new Date().toISOString().split("T")[0], notes?: string): Mood {
    const data = this.getData()
    const moodId = `mood_${Date.now()}`
    const moodEntry: Mood = {
      id: moodId,
      userId,
      mood,
      date,
      notes,
    }
    data.moods[moodId] = moodEntry
    this.saveData(data)
    return moodEntry
  }

  getMoods(userId: string): Mood[] {
    const data = this.getData()
    return Object.values(data.moods).filter((m: any) => m.userId === userId)
  }

  getMoodsByDate(userId: string, date: string): Mood | null {
    const data = this.getData()
    return Object.values(data.moods).find((m: any) => m.userId === userId && m.date === date) || null
  }

  // Analytics
  getHabitStats(
    userId: string,
    habitId: string,
    days = 30,
  ): {
    completedDays: number
    totalDays: number
    completionRate: number
  } {
    const completions = this.getCompletions(userId, habitId)
    const today = new Date()
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - days)

    const completedDays = completions.filter((c) => {
      const completionDate = new Date(c.date)
      return completionDate >= startDate && completionDate <= today
    }).length

    return {
      completedDays,
      totalDays: days,
      completionRate: Math.round((completedDays / days) * 100),
    }
  }

  getCategoryStats(userId: string): Record<string, { count: number; completionRate: number }> {
    const habits = this.getHabits(userId)
    const stats: Record<string, { count: number; completionRate: number }> = {}

    habits.forEach((habit) => {
      if (!stats[habit.category]) {
        stats[habit.category] = { count: 0, completionRate: 0 }
      }
      stats[habit.category].count += 1

      const habitStats = this.getHabitStats(userId, habit.id, 7)
      stats[habit.category].completionRate += habitStats.completionRate
    })

    Object.keys(stats).forEach((category) => {
      stats[category].completionRate = Math.round(stats[category].completionRate / stats[category].count)
    })

    return stats
  }
}

export const dataStore = new DataStore()
