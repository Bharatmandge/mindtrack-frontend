import { type NextRequest, NextResponse } from "next/server"
import { dataStore } from "@/lib/data-store"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const moods = dataStore.getMoods(userId)
    return NextResponse.json({ moods })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, mood, date, notes } = await request.json()

    if (!userId || !mood) {
      return NextResponse.json({ error: "User ID and mood are required" }, { status: 400 })
    }

    const moodEntry = dataStore.saveMood(userId, mood, date, notes)
    return NextResponse.json({ mood: moodEntry })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
