import { type NextRequest, NextResponse } from "next/server"
import { dataStore } from "@/lib/data-store"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")
    const habitId = request.nextUrl.searchParams.get("habitId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    if (habitId) {
      const stats = dataStore.getHabitStats(userId, habitId, 30)
      return NextResponse.json({ stats })
    }

    const categoryStats = dataStore.getCategoryStats(userId)
    return NextResponse.json({ categoryStats })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
