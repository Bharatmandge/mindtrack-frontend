import { type NextRequest, NextResponse } from "next/server"
import { suggestionEngine } from "@/lib/suggestion-engine"

export async function GET(request: NextRequest) {
  try {
    const habitName = request.nextUrl.searchParams.get("habit")

    if (!habitName) {
      return NextResponse.json({ error: "Habit name is required" }, { status: 400 })
    }

    const tips = suggestionEngine.getHabitTips(habitName)
    return NextResponse.json({ tips })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
