import { type NextRequest, NextResponse } from "next/server"
import { users } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    if (Object.values(users).some(u => u.email === email)) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }

    const userId = `user_${Date.now()}`
    users[userId] = { id: userId, email, password }

    return NextResponse.json({
      user: { id: userId, email }
    })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
