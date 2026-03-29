import { NextResponse } from "next/server"
import { settleAndRecalculate } from "@/lib/pl-settle"

export async function GET() {
  try {
    const settled = await settleAndRecalculate()
    return NextResponse.json({ ok: true, settled })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
