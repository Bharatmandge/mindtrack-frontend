import { type NextRequest, NextResponse } from "next/server"

// Mock completion data - in production, this would come from a database
const completionDB: Record<string, Record<string, boolean>> = {}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")
    const month = request.nextUrl.searchParams.get("month")
    const year = request.nextUrl.searchParams.get("year")
    const habitId = request.nextUrl.searchParams.get("habitId")

    if (!userId || !month || !year) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const key = `${userId}_${habitId || "all"}`
    const completionData =
      completionDB[key] || generateMockCompletionData(Number.parseInt(month), Number.parseInt(year))

    return NextResponse.json({ completionData })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, habitId, date, completed } = await request.json()

    if (!userId || !habitId || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const key = `${userId}_${habitId}`
    if (!completionDB[key]) {
      completionDB[key] = {}
    }

    completionDB[key][date] = completed

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Generate mock completion data for demonstration
function generateMockCompletionData(month: number, year: number): Record<string, boolean> {
  const data: Record<string, boolean> = {}
  const daysInMonth = new Date(year, month, 0).getDate()

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    // 70% completion rate with some patterns
    data[dateStr] = Math.random() > 0.3 || day % 3 === 0
  }

  return data
}
