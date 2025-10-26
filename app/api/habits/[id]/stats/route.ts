import { dataStore } from "@/lib/data-store"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: habitId } = params

    // Get the habit to find the user ID
    const habit = dataStore.getHabit(habitId)
    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 })
    }

    // Get completion stats for the last 7 days
    const stats = dataStore.getHabitStats(habit.userId, habitId, 7)

    return NextResponse.json({
      habitId,
      ...stats,
    })
  } catch (error) {
    console.error("Error fetching habit stats:", error)
    return NextResponse.json({ error: "Failed to fetch habit stats" }, { status: 500 })
  }
}
