import { type NextRequest, NextResponse } from "next/server"
import { dataStore } from "@/lib/data-store"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const habits = dataStore.getHabits(userId)
    return NextResponse.json({ habits })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, name, category } = await request.json()

    if (!userId || !name || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const habit = dataStore.createHabit(userId, name, category)
    return NextResponse.json({ habit })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
