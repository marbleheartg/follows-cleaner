import { UserBulk } from "@/lib/api/types"
import axios from "axios"
import { NextRequest, NextResponse } from "next/server"

const { NEYNAR_API_KEY } = process.env

export async function GET(req: NextRequest) {
  try {
    const fid = req.nextUrl.searchParams.get("fid")
    if (!fid) throw new Error("FidNotSpecified")

    const { data: usersData } = await axios.get<UserBulk>(`https://api.neynar.com/v2/farcaster/user/bulk`, {
      headers: { "x-api-key": NEYNAR_API_KEY },
      params: { fids: fid },
    })

    const user = usersData.users[0]

    return NextResponse.json(user)
  } catch (err) {
    console.error(err)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
