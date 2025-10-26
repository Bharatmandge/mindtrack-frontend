import { type NextRequest, NextResponse } from "next/server"
import { dataStore } from "@/lib/data-store"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, date } = await request.json()
    const habitId = params.id

    if (!userId || !habitId) {
      return NextResponse.json(
        { error: "User ID and Habit ID are required" },
        { status: 400 }
      )
    }

    console.log(`[API /complete] Completing habit ${habitId} for user ${userId} on date ${date}`)

    const habit = dataStore.getHabit(habitId)
    if (!habit) {
      console.error(`[API /complete] Habit not found: ${habitId}`)
      return NextResponse.json({ error: "Habit not found" }, { status: 404 })
    }

    if (habit.userId !== userId) {
      console.error(`[API /complete] Habit ${habitId} does not belong to user ${userId}`)
      return NextResponse.json({ error: "Habit not found for this user" }, { status: 403 })
    }

    const today = date || new Date().toISOString().split("T")[0]

    if (habit.lastCompleted === today) {
      console.warn(`[API /complete] Habit ${habitId} already completed today`)
      return NextResponse.json({
        error: "Habit already completed today",
        success: false,
        habit
      }, { status: 400 })
    }

    const updatedHabit = dataStore.completeHabit(habitId, today)

    if (!updatedHabit) {
      console.error(`[API /complete] Failed to update habit ${habitId}`)
      return NextResponse.json({ error: "Failed to update habit" }, { status: 500 })
    }

    console.log(`[API /complete] Habit ${habitId} completed successfully`)

    return NextResponse.json({
      success: true,
      habit: updatedHabit
    })
  } catch (error) {
    console.error("[API /complete] UNHANDLED ERROR", error)
    return NextResponse.json(
      { error: "Internal server error", errorMessage: (error as Error).message },
      { status: 500 }
    )
  }
}
