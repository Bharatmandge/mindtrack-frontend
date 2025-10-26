import { type NextRequest, NextResponse } from "next/server"
import { insightsEngine } from "@/lib/insights-engine"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const insights = insightsEngine.generateInsights(userId)
    return NextResponse.json({ insights })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
