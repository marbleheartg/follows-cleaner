import { Following } from "@/lib/api/types"
import axios from "axios"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const fid = req.nextUrl.searchParams.get("fid")
    if (!fid) throw new Error("NotAuthenticated")
    const cursor = req.nextUrl.searchParams.get("cursor")

    const res = await axios.get<Following>("https://api.neynar.com/v2/farcaster/following", {
      params: { fid, limit: 100, cursor },
      headers: { "x-api-key": process.env.NEYNAR_API_KEY },
    })

    return NextResponse.json(res.data)
  } catch (err) {
    console.error(err)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
