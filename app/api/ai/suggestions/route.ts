import { type NextRequest, NextResponse } from "next/server"
import { suggestionEngine } from "@/lib/suggestion-engine"

export async function POST(request: NextRequest) {
  try {
    const { userId, existingHabits } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const suggestions = suggestionEngine.generateSuggestions(userId, existingHabits || [], 3)

    return NextResponse.json({ suggestions })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
